function bigEndian() {
    // Returns TRUE for big endian, FALSE for little endian
      var arrayBuffer = new ArrayBuffer(2);
      var uint8Array = new Uint8Array(arrayBuffer);
      var uint16array = new Uint16Array(arrayBuffer);
      uint8Array[0] = 0xAA; // set first byte
      uint8Array[1] = 0xBB; // set second byte
      if(uint16array[0] === 0xBBAA) return false; // little endian
      if(uint16array[0] === 0xAABB) return true; // big endian
      else throw new Error("Something crazy just happened");
 }

 function swap16(val) {
      return ((val & 0xFF) << 8)
             | ((val >> 8) & 0xFF);
 }

// Converts a uint8 decimal value to a 0-padded hex byte string, or converts
// a Uint8Array to a string of 0-padded hex bytes.
function d2h(d) {
    var s = "";

    if(typeof(d) == 'object')
    {
        // treat it as a Uint8Array
        for(var i = 0; i < d.length; i++)
        {
            var b = (+d[i]).toString(16);
            if(b.length < 2) {
                b = '0' + b;
            }
            s += b;
        }
    }
    else
    {
        s = (+d).toString(16);
        if(s.length < 2) {
            s = '0' + s;
        }
    }
    
    return s;
}

var userSequenceLength = 16;

document.getElementById("btnGenerate").addEventListener("click", generateOutput);

document.getElementById("user_sequencelength").addEventListener('change', function() {
    userSequenceLength = this.value;
    console.log(userSequenceLength);
})


document.querySelector('input').addEventListener('change', function() {
    var reader = new FileReader();
    reader.onload = function() {
        var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer),
            binaryString = String.fromCharCode.apply(null, array);

            console.log(binaryString);
            //document.getElementById('output').innerText = binaryString;
            for(var i = 0; i < array.length; i++)
            {
                //console.log(d2h(array[i]));
            }

            // I think/hope that all file and track header offsets below are fixed
            // in our particular case

            // Header
            var fileHeader = array.subarray(0, 4); // should be 'MThd'
            var formatType = array.subarray(8,10); // should be 00 00
            var trackChunks = array.subarray(10, 12); // should be 00 01
            var divisionValue = array.subarray(12, 14); // PPQN
            // Track chunk
            var trackHeader = array.subarray(14, 18); // should be 'MTrk'
            var trackDataSize = array.subarray(18, 22); // length of data from next byte onwards
            
            // If those all check out, step through and keep count.
            var offset = 22;

            // We expect a timestamp of 00 then FF 03 for a Track Name meta event.
            var tracknameMeta = array.subarray(offset, offset+3);
            
            if(d2h(tracknameMeta) == "00ff03")
            {   
                var tracknameLength = 0;
                tracknameLength = array[offset+3];

                var trackName = array.subarray(offset+4, offset+4+tracknameLength);
                console.log(d2h(trackName));
                offset += 4 + tracknameLength;
            }
            
            // We're interested in bytes of 0x80 or greater. Channel events go
            // from 0x8N to 0xEN, where N is the channel number (0-F).
            // Meta events all start with FF, and the only ones we expect to see are
            // FF 03 LL [TEXT] (Track Name of length LL),
            // FF 58 04 NN MM LL TT (Time Signature) and
            // FF 2F 00 (End of Track, required as last event in a MTrk chunk)
            //
            // Each time we find a Channel/Meta event, we should read the previous
            // byte to get its Delta Time. 
            
            var totalTime = 0; // in ticks

            // We'll loop through once to get the total time in ticks, and calculate
            // how many ticks each step lasts, and also check some meta events,
            // then we'll loop again to create an array of note objects and timings.
            for(var i = 0; i < array.length; i++)
            {
                if(array[i] >= 0x80)
                {           
                    var timedelta = array[i-1]; // in ticks
                    totalTime += timedelta;
                    
                    // It's important to know these events exist, but we don't care 
                    // about them. Although we might care about Time Signature...
                    if(array[i] == 0xff)
                    {
                        // Meta event
                        if(array[i+1] == 0x03)
                        {                            
                            // Track Name 
                            console.log("Found a track name with delta " + totalTime);
                        }
                        else if(array[i+1] == 0x58)
                        {
                            // Time Signature
                            console.log("Found a time signature with delta " + totalTime);
                        }
                        else if(array[i+1] == 0x2f)
                        {
                            // End of track
                            console.log("Found the end of the track with delta " + totalTime);
                        }
                    }

                }
            }

            var stepTime = totalTime / userSequenceLength; // in ticks

            // We're looking to fill the following arrays (all max length 16):
            //      Pitch data
            //      Accent flags
            //      Slide flags - slide is effectively portamento, and in MIDI is represented by the previous note overlapping the current note; the current note is 'slid' to
            //      Ties - a tied note makes consecutive non-rest steps with the same pitch behave as one long note, ie no retrigger
            //      Rests - all steps are rests by default, unless unset (bit set to 0) to make that step audible
            // and find the following values:
            //      Triplet flag - actually not sure wtf we do about this
            //      Sequence length (between 1 and 16)
            //
            // Pitch data is easy - look at Note On events
            // Accent flags are also easy - look at Note On events with max velocity
            // Slide flags are set if there's a Note On before the previous Note On has had a corresponding Note Off
            // Triplet flag - setting this is easy, but under which conditions? Does it have any meaning beyond limiting pattern length to 15?
            // Sequence length - we should maybe make this configurable on the UI, to be honest
            // Ties and Rests...gnarly bitwise stuff ahoy.

            var pitchSteps = [];
            var accentFlags = [];
            var slideFlags = [];

            // Use this to detect Slides
            var hungNoteValue = 0;
            
            var elapsedTime = 0; // in ticks
            var currentstep = 0;

            // Four bytes each for ties and rests that we'll manipulate later            
            var tieMap = new Uint8Array([0x0F, 0x0F, 0x0F, 0x0F]);
            var restMap = new Uint8Array([0x0F, 0x0F, 0x0F, 0x0F]);
            

            // Start from the current offset position (after the header etc.) so we're only
            // looping the Track chunk
            for(var i = offset; i < array.length; i++)
            {
                // This gives us only Notes or Meta Events
                if(array[i] >= 0x80) 
                {

                    // Doesn't matter what the event is, we should increment elapsedTime by the event's delta.
                    // NOTE: this isn't robust enough to work for sequences with enormous gaps between notes.
                    // So don't be surprised when it doesn't. 1-byte delta times only pls.
                    elapsedTime += array[i-1];

                    // Current step is used for our own temporary array indexing, and then to calculate the rest/tie bitwise stuff
                    currentstep = Math.round(elapsedTime / (totalTime / userSequenceLength));

                    // This gives us only notes
                    if(array[i] <= 0xEF)
                    {

                        // Found NoteOn
                        if(array[i] >= 0x90 && array[i] < 0xA0)
                        {
                            console.log("Found a Note ON with value " + array[i+1] + " with velo " + array[i+2] + " at index " + i) ;
                            
                            

                            pitchSteps.push(
                                {
                                    "pitch": array[i+1],
                                    "timestamp": elapsedTime,
                                    "step" : currentstep
                                }
                            );
                                                    
                            if(array[i+2] > 0x64)
                            {
                                accentFlags.push(true);
                            }
                            else
                            {
                                accentFlags.push(false);
                            }

                            if(hungNoteValue > 0)
                            {
                                // hungNoteValue should be reset to 0 by noteoff. 
                                // If it's greater than, this note is slid. Slided. Slidden. Slidulterated.
                                slideFlags.push(true);
                            }
                            else
                            {
                                slideFlags.push(false);
                            }

                            hungNoteValue = array[i+1];
                            
                            // Unset the rest for this step
                            // Layout:
                            // XXXX7654,XXXX3210,XXXXFEDC,XXXXBA98

                            // Rests set by default: 00001111, left nibble ignored
                            // Clear right-nibble bits to un-rest notes
                                                                                                                  
                            if(currentstep < 4)
                            {                                
                                var maskbyte = new Uint8Array([0x00000001]);
                                maskbyte[0] << currentstep;     
                                console.log(d2h(maskbyte[0]) + "  currentstep: " + currentstep); 
                                restMap[1] &= ~maskbyte[0];
                            }
                            else if(currentstep >= 4 && currentstep < 8)
                            {                                
                                var maskbyte = new Uint8Array([0x00000001]);
                                maskbyte[0] << (currentstep-4);
                                console.log(d2h(maskbyte[0]));
                                restMap[0] &= ~maskbyte[0];
                            }
                            else if(currentstep >= 8 && currentstep < 12)
                            {
                                var maskbyte = new Uint8Array([0x00000001]);
                                maskbyte[0] << (currentstep-8);
                                console.log(d2h(maskbyte[0]));
                                restMap[3] &= ~maskbyte[0];
                            }
                            else if(currentstep >= 12 && currentstep < 16)
                            {                                
                                var maskbyte = new Uint8Array([0x00000001]);
                                maskbyte[0] << (currentstep-12);         
                                console.log(d2h(maskbyte[0]));
                                restMap[2] &= ~maskbyte[0];
                            }

                        }

                        // Found NoteOff
                        if(array[i] >= 0x80 && array[i] < 0x90)
                        {
                            console.log("Found a Note OFF with value " + array[i+1] + " with velo " + array[i+2]) ;

                            // If this noteoff corresponds to the current hungNoteValue, reset it to zero.
                            // If not, the note will hang and we'll set a slide flag on the next loop.
                            if(hungNoteValue == array[i+1])
                            {
                                hungNoteValue = 0;
                            }
                        }

                        // I foresee a problem with slid notes having the wrong pitch but...hopefully not.

                    }

                    // We know what step we're in, so we can set rests/ties accordingly
                    // First nibble is never used. Mask laid out like this:
                    // XXXX7654, XXXX3210, XXXXFEDC, XXXXBA98
                }
            }

            console.log("Pitch Steps:");
            console.log(pitchSteps);
            console.log("Accent Flags:");
            console.log(accentFlags);
            console.log("Slide Flags:");
            console.log(slideFlags);
            console.log("restMap");
            console.log(d2h(restMap));
    }

    reader.readAsArrayBuffer(this.files[0]);
});

function checkInput()
{
    console.log("clicked");
    var file = document.getElementById("fileinput").files[0];

    document.getElementById("output").innerText = "done";
    
}

function generateOutput()
{

}