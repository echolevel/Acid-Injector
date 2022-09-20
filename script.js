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

function d2b(d) {
    var s = "";

    if(typeof(d) == 'object')
    {
        // treat it as a Uint8Array
        for(var i = 0; i < d.length; i++)
        {
            var b = (+d[i]).toString(2).padStart(8, '0');
            s += b;
            s += ' ';
        }        
    }
    else
    {
        s = (+d).toString(2).padStart(8, '0');
    }

    return s;
}

var userSequenceLength = 16;

var outBytes = new Uint8Array(146);

var midiIsValid = false;
var ouptutIsReady = false;

document.getElementById("btnGenerate").addEventListener("click", generateOutput);

document.getElementById("user_sequencelength").addEventListener('change', function() {
    userSequenceLength = this.value;
    console.log(userSequenceLength);
})


document.querySelector('input').addEventListener('change', function() {
    var reader = new FileReader();
    reader.onload = function() {
        var arrayBuffer = this.result;
        var array = new Uint8Array(arrayBuffer);

        //var binaryString = String.fromCharCode.apply(null, array);
        //console.log(binaryString);        

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
        
        var outdiv = document.getElementById('output');
        outdiv.innerHTML = '';

        if(fileHeader.toString() == '77,84,104,100')
        {
            midiIsValid = true;
            outdiv.appendChild(document.createTextNode('MIDI header is valid'));
            outdiv.appendChild(document.createElement('br'));
        }
        else
        {
            midiIsValid = false;
            outdiv.appendChild(document.createTextNode('Invalid MIDI file header'));
            outdiv.appendChild(document.createElement('br'));
        }

        if(formatType.toString() == '0,0')
        {
            outdiv.appendChild(document.createTextNode('Format type is 0'));
            outdiv.appendChild(document.createElement('br'));
        }
        else
        {
            midiIsValid = false;
            outdiv.appendChild(document.createTextNode('Invalid MIDI file format type (should be type 0)'));
            outdiv.appendChild(document.createElement('br'));
        }

        if(trackChunks.toString() == '0,1')
        {
            outdiv.appendChild(document.createTextNode('Track count: 1'));
            outdiv.appendChild(document.createElement('br'));

            outdiv.appendChild(document.createTextNode('PPQN: ' + divisionValue[1].toString()));
            outdiv.appendChild(document.createElement('br'));

            outdiv.appendChild(document.createTextNode('Everything\'s probably fine'));
            outdiv.appendChild(document.createElement('br'));
        }
        else
        {
            midiIsValid = false;
            outdiv.appendChild(document.createTextNode('Invalid MIDI track count (should be 1)'));
            outdiv.appendChild(document.createElement('br'));
        }

        if(midiIsValid == false)
        {
            return;
        }

        // If those all check out, step through and keep count.
        var offset = 22;

        // We expect a timestamp of 00 then FF 03 for a Track Name meta event.
        var tracknameMeta = array.subarray(offset, offset+3);
        
        if(d2h(tracknameMeta) == "00ff03")
        {   
            var tracknameLength = 0;
            tracknameLength = array[offset+3];

            var trackName = array.subarray(offset+4, offset+4+tracknameLength);
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

        var timeSignatureNumerator = 0;
        var timeSignatureDenominator = 0;
        var quarterNotesPerBeat = 0;
        var pulsesPerQuarterNote = 0;
        var microsecondsPerQuarterNote = 0;

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
                        // Found Track Name
                    }
                    else if(array[i+1] == 0x58)
                    {
                        // Found Time Signature
                        
                        timeSignatureNumerator = array[i+3];

                        timeSignatureDenominator = array[i+4];

                        if(timeSignatureDenominator == 1)
                        {
                            quarterNotesPerBeat = 4;
                        }
                        if(timeSignatureDenominator == 2)
                        {
                            quarterNotesPerBeat = 2;
                        }
                        if(timeSignatureDenominator == 4)
                        {
                            quarterNotesPerBeat = 1;
                        }
                        if(timeSignatureDenominator == 8)
                        {
                            quarterNotesPerBeat = 0.5;
                        }
                        if(timeSignatureDenominator == 16)
                        {
                            quarterNotesPerBeat = 0.25;
                        }
                        // There's another one that I don't even slightly understand right now and can't be arsed to figure out

                        pulsesPerQuarterNote = array[i+5];

                        microsecondsPerQuarterNote = array[i+6]; // remember: 1,000,000 microseconds per second
                        
                    }
                    else if(array[i+1] == 0x2f)
                    {
                        // Found End of Track
                    }
                }

            }
        }

        
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

        for(var d = 0; d < 16; d++)
        {
            pitchSteps.push({
                "pitch": 0x18,
                "timestamp":0,
                "step": d,
                "duration":0
            });

            accentFlags.push(false);

            slideFlags.push(false);
        }        

        // Use this to detect Slides
        var hungNoteValue = 0;        

        // Four bytes each for ties and rests that we'll manipulate later            
        var restMap = new Uint8Array([0b00001111, 0b00001111, 0b00001111, 0b00001111]);
        var tieMap = new Uint8Array([0b00001111, 0b00001111, 0b00001111, 0b00001111]);
        


        var stepDuration = totalTime / 16; // in ticks
        var elapsedTime = 0; // in ticks
        var currentstep = 0;
        var tickCounter = 0; // add ticks to this to check whether currentstep should be incremented

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
                // It's also inaccurate and I'm not sure how to improve it.
                currentstep = Math.round((elapsedTime) / stepDuration);       

                // This gives us only notes
                if(array[i] <= 0xEF)
                {

                    // Found NoteOn
                    if((array[i] >= 0x90 && array[i] < 0xA0))
                    {
                        //console.log("Found a Note ON with value " + array[i+1] + " with velo " + array[i+2] + " at index " + i) ;
                        /*
                        pitchSteps.push(
                            {
                                "pitch": array[i+1] - 12,
                                "timestamp": elapsedTime,
                                "step" : currentstep,
                                "duration": 0
                            }
                        );
                        */
                        pitchSteps[currentstep].pitch = array[i+1] - 12;
                        pitchSteps[currentstep].timestamp = elapsedTime;
                        pitchSteps[currentstep].duration = 0;
                        pitchSteps[currentstep].step = currentstep;
                                                
                        if(array[i+2] >= 0x64)
                        {
                            console.log("Setting accent at step " + currentstep);
                            accentFlags[currentstep] = true;
                        }
                        else
                        {
                            accentFlags[currentstep] = false;
                        }

                        if(hungNoteValue > 0)
                        {
                            // hungNoteValue should be reset to 0 by noteoff. 
                            // If it's greater than, this note is slid. Slided. Slidden. Slidulterated.
                            slideFlags[currentstep] = true;
                            
                        }
                        else
                        {
                            slideFlags[currentstep] = false;
                        }

                        hungNoteValue = array[i+1];
                        
                        // Unset the rest for this step
                        // Layout:
                        // XXXX7654,XXXX3210,XXXXFEDC,XXXXBA98

                        // Rests set by default: 00001111, left nibble ignored
                        // Clear right-nibble bits to un-rest notes
                            
                        var maskbyte = new Uint8Array([0b00000001]);        
                        var maskbyte = 0b00000001; 
                        
                        if(currentstep < 4)
                        {     
                            //console.log("maskbyte: " + d2b(maskbyte<< currentstep) + " step: " + currentstep);
                            restMap[1] &= ~(maskbyte << currentstep);                                
                        }
                        else if(currentstep >= 4 && currentstep < 8)
                        {                                
                            restMap[0] &= ~(maskbyte << (currentstep - 4));       
                        }
                        else if(currentstep >= 8 && currentstep < 12)
                        {
                            restMap[3] &= ~(maskbyte << (currentstep - 8));       
                        }
                        else if(currentstep >= 12 && currentstep < 16)
                        {                                                                
                            restMap[2] &= ~(maskbyte << (currentstep - 12));       
                        }

                        // Ties: I suppose we set a tie if the previous note is the same as this note 
                        // but there's been no noteoff?

                    }

                    // Found NoteOff
                    if(array[i] >= 0x80 && array[i] < 0x90)
                    {
                        //console.log("Found a Note OFF with value " + array[i+1] + " with velo " + array[i+2] + " at timestamp " + elapsedTime) ;

                        // Work back through the existing notes until we find a match, then calculate that note's duration in ticks                        
                        var n = currentstep;
                        while(n--)
                        {
                            if(pitchSteps[n] !== undefined)
                            {
                                if(pitchSteps[n].hasOwnProperty('pitch'))
                                {
                                    if (pitchSteps[n].pitch == array[i+1]-12 && pitchSteps[n].step != currentstep)
                                    {                                        
                                        pitchSteps[n].duration = elapsedTime - pitchSteps[n].timestamp;
                                        console.log("Step " + currentstep +  ":found a matching NoteOn for NoteOff " + (array[i+1]-12) + " at step " + currentstep + ", setting duration " + pitchSteps[n].duration + ". Elapsed: " + elapsedTime);
                                        break;
                                    }
                                    
                                }
                            }
                        }

                        

                        // If this noteoff corresponds to the current hungNoteValue, reset it to zero.
                        // If not, the note will hang and we'll set a slide flag on the next loop.
                        if(hungNoteValue == array[i+1])
                        {
                            hungNoteValue = 0;
                        }
                    }

                    // I foresee a problem with slid notes having the wrong pitch but...hopefully not.

                }

            }


        }

        console.log("Pitch Steps:");
        console.log(pitchSteps);
        console.log("Accent Flags:");
        console.log(accentFlags);
        console.log("Slide Flags:");
        console.log(slideFlags);
        console.log("restMap");
        console.log(d2b(restMap));
        console.log(d2h(restMap));

        // Prepare the output file binary
        // Reset the array
        outBytes = new Uint8Array(146);
        
        var writeOffset = 0;

        outBytes[writeOffset] = 0x23; 
        writeOffset++;
        outBytes[writeOffset] = 0x98; 
        writeOffset++;
        outBytes[writeOffset] = 0x54; 
        writeOffset++;
        outBytes[writeOffset] = 0x76; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x08; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x54; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x44; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x2D; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x33; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x0A; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x31; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x2E; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x33; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x2E; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x37; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x70; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;
        outBytes[writeOffset] = 0x00; 
        writeOffset++;

        // write offset 36

        // Write the pitches
        for(var i = 0; i < 16; i++)
        {            
            if(pitchSteps[i] !== undefined)
            {
                if(pitchSteps[i].hasOwnProperty('pitch'))
                {
                    // 0x18 is MIDI C1 (decimal 24), and C2 to the TD-3.
                    // Sting generates out of range notes. It would be nice if it didn't...
                    // Maybe some other clones supported extended range? 
                    // Should we clamp them, set them to 0x18, or ignore them?
                    // Whatever we do, we need to do it before we set the pattern bitmask
                    var thispitch = d2h(pitchSteps[i].pitch);
                    var msb = parseInt(thispitch.charAt(0), 16);
                    var lsb = parseInt(thispitch.charAt(1), 16);
                    
                    outBytes[writeOffset] = msb;
                    outBytes[writeOffset+1] = lsb;
                    writeOffset += 2;

                    console.log("Duration: " + pitchSteps[i].duration);
                }
                
            }
            else
            {                
                outBytes[writeOffset] = 0x01;
                outBytes[writeOffset+1] = 0x08;
                writeOffset += 2;
            }
            
        }

        // write offset 67
        
        // Write the accent flags
        for(var i = 0; i < 16; i++)
        {
            if(accentFlags[i] === 'undefined')
            {
                outBytes[writeOffset] = 0x00;
                outBytes[writeOffset+1] = 0x01;
                writeOffset += 2;
            }
            else
            {
                outBytes[writeOffset] = 0x00;
                outBytes[writeOffset+1] = accentFlags[i];
                writeOffset += 2;
            }
        }

        // write offset 99

        // Write the slide flags
        for(var i = 0; i < 16; i++)
        {
            if(slideFlags[i] === 'undefined')
            {
                outBytes[writeOffset] = 0x00;
                outBytes[writeOffset+1] = 0x01;
                writeOffset += 2;
            }
            else
            {
                outBytes[writeOffset] = 0x00;
                outBytes[writeOffset+1] = slideFlags[i];
                writeOffset += 2;
            }
        }

        // write offset 131

        // Write the triplet flag (2 bytes)
        outBytes[writeOffset] = 0x00;
        outBytes[writeOffset+1] = 0x00;
        writeOffset += 2;

        // write offset 133

        // Write the sequence length
        if(userSequenceLength == 16)
        {
            outBytes[writeOffset] = 0x01;
            outBytes[writeOffset+1] = 0x00;
            writeOffset += 2;
        }
        else
        {
            outBytes[writeOffset] = 0x00;
            outBytes[writeOffset+1] = userSequenceLength;
            writeOffset += 2;
        }
        
        // 2 bytes of padding
        writeOffset += 2;

        // Detect tied notes
        for(var p = 0; p < pitchSteps.length; p++)
        {
            if(pitchSteps[p].hasOwnProperty('duration'))
            {
                // On the TD-3, setting a tie step pushes the other notes along.
                // The first step can't be a tie, or there'd never be a Note On.
                // There's no audible difference on the TD-3 between a tied note and a slide to the same note
                if(pitchSteps[p].duration > stepDuration/1.5)
                {
                    console.log("Found a tied note at pitchStep index " + p + ": note duration was longer than a full step");
                }
            }
        }

        // Write the ties
        outBytes[writeOffset] = tieMap[0];
        outBytes[writeOffset+1] = tieMap[1];
        outBytes[writeOffset+2] = tieMap[2];
        outBytes[writeOffset+3] = tieMap[3];
        writeOffset += 4;

        // Write the rests
        outBytes[writeOffset] = restMap[0];
        outBytes[writeOffset+1] = restMap[1];
        outBytes[writeOffset+2] = restMap[2];
        outBytes[writeOffset+3] = restMap[3];
        writeOffset += 4;
                
        outputIsReady = true;
            
    }

    reader.readAsArrayBuffer(this.files[0]);
});

// Save the file
var saveOutBytes = (function() {
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
        var blob = new Blob(data, {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function checkInput()
{
    console.log("clicked");
    var file = document.getElementById("fileinput").files[0];

    document.getElementById("output").innerText = "done";
    
}

function generateOutput()
{
    if(midiIsValid && outputIsReady)
    {
        saveOutBytes([outBytes], 'output.seq');       
    }    
}