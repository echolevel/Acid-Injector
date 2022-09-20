# AcidConverter
 
<!-- Output copied to clipboard! -->

<!-----

Yay, no errors, warnings, or alerts!

Conversion time: 1.047 seconds.


Using this Markdown file:

1. Paste this output into your source file.
2. See the notes and action items below regarding this conversion run.
3. Check the rendered output (headings, lists, code blocks, tables) for proper
   formatting and use a linkchecker before you publish this page.

Conversion notes:

* Docs to Markdown version 1.0β33
* Mon Sep 19 2022 17:00:09 GMT-0700 (PDT)
* Source doc: Behringer TD-3 .seq file format
* Tables are currently converted to HTML tables.
----->



```
Behringer TD-3 .seq file (Synthtribe format for TD-3 pattern import/export)
==========================================================================

Byte offset (hex)

00-1F		Header (24 bytes)
			Device identifier, firmware revision etc

20-24		Pattern header (4 bytes)
			00 70 00 00 (.P..) seems to be a subheader for a Pattern.
			Crave seems to use the latter two bytes for the size
			of the data block; TD-3 apparently doesn't care (always fixed).
			.sqs (sequence dump) files have a similar main header,
			8 null bytes, then 64 pattern blocks delineated by this.
			A TD-3 pattern is 120 bytes long.

24-43		Pitch data (32 bytes)
			Default pitch is 01 08 = 24 = C1 in the MIDI spec,
			but C2 in TD-3 land.
			Unset pitches are always 01 08.
			Set pitches are placed consecutively in array,
			regardless of timing. In other words, there's no
			'whitespace' between non-adjacent notes.
			The first value is the first set pitch, but not 
			necessarily Step 1. If the total number of set pitches
			< 16, remaining words are set to 01 08 (note C-2)

44-63		Acccent flags (32 bytes)
			00 00 or 00 01. The index of each value corresponds to the
			index of a set pitch so, again, 'whitespace' is ignored and
			if the number of set flags < 16, remaining bytes are zero-
			padded.

64-83		Slide flags (32 bytes)
			Works the same way as Accent (see above)

84-85		Triplet flag (2 bytes)
			00 00 or 00 01
			If set, the pattern is limited to 15 steps (triplet mode)

86-87		Sequence Length (2 bytes)
			00 01 to 00 0F represent 1 to 15 step sequences
			01 00 is a full, 16-step sequence



88-89		Possible padding bytes?

8A-91		Unknown (8 bytes)
			Seems like 4 bytes are for Ties and next 4 are Rests?



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0F 0E 0F 0F  - if this is a bitmask, then 00001111,00001110,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0F 0C 0F 0F 00001111,00001100,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0F 08 0F 0F 00001111,00001000,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0F 00 0F 0F 00001111,00000000,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0E 00 0F 0F 00001110,00000000,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
0C 00 0F 0F 00001100,00000000,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
08 00 0F 0F 00001000,00000000,00001111,00001111



<table>
  <tr>
   <td>```

<strong><code>1</code></strong>
   </td>
   <td><strong><code>2</code></strong>
   </td>
   <td><strong><code>3</code></strong>
   </td>
   <td><strong><code>4</code></strong>
   </td>
   <td><strong><code>5</code></strong>
   </td>
   <td><strong><code>6</code></strong>
   </td>
   <td><strong><code>7</code></strong>
   </td>
   <td><strong><code>8</code></strong>
   </td>
   <td><strong><code>9</code></strong>
   </td>
   <td><strong><code>10</code></strong>
   </td>
   <td><strong><code>11</code></strong>
   </td>
   <td><strong><code>12</code></strong>
   </td>
   <td><strong><code>13</code></strong>
   </td>
   <td><strong><code>14</code></strong>
   </td>
   <td><strong><code>15</code></strong>
   </td>
   <td><strong><code>16</code></strong>
   </td>
  </tr>
  <tr>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
   <td>
   </td>
  </tr>
</table>



```
00 00 0F 0F 00000000,00000000,00001111,00001111

First nibble is never used. Mask seems to be laid out like this:
XXXX7654,XXXX3210,XXXXFEDC,XXXXBA98

where 1 sets a rest/tie and 0 unsets the rest/tie. Hence no notes (all rests):
0F0F0F0F
and one note (first rest disabled):
0F0E0F0F, etc.

Behringer TD-3 .sqs file (Synthtribe format for TD-3 full sequencer dump)
=========================================================================

00-1F		Header (24 bytes)
			Device identifier, firmware revision, etc

20-27		Null bytes (8 bytes)
			Other devices (e.g. Crave) use this to store the length of the
			following data, whereas pattern data blocks for the TD-3 are
			always a fixed length.

28-2B		Pattern header (4 bytes)
			00 70 00 00 (".P..") signifies the start of a pattern data block

2C-9F		Pattern data (114 bytes)
			See the notes for the TB-3 .seq file format.

A0-A3		Pattern footer (10 bytes)
        e.g. 00 00 00 03 00 00 00 0D 00 00
        where 03 is the Pattern Group (0-3) and 0D is the pattern's
        index in the group, from 00 00 00 00 to 00 00 0F 00,
			where A section patterns run 0-7 and B section patterns run
			8-F.

The 28-A3 patterndata block, including the pattern header, repeats 64 times for each of the TD-3's pattern slots. The final pattern has no pattern footer.

Notes:
C-4	0B 00
B-3	02 0F
A-3	02 0D
G-3	02 0B
F-3	02 09
E-3	02 08
D-3	02 06
C-3	02 04
B-2	02 03
A-2	02 01
G-2	01 0F
F-2	01 0D
E-2	01 0C
D-2	01 0A
C-2	01 08
B-1	01 07

Ableton Live Exported MIDI Clip
===============================

Assuming a single-track, single-clip export of a TB-303 pattern generated by the Sting M4L device.

Invaluable info here: https://github.com/velipso/basicmidi/blob/master/docs/midi.md

Header chunk

Byte offset (hex)

00-03		Chunk type 'MThd', 4 bytes
04-07		Data size, 4 bytes
08-09		Format, 2 bytes - usually 00, "single multi-channel track"
		which means Track Chunks should be 00 01
0A-0B		Track chunks, 2 bytes, should be 00 01!
0C-0D		Division, 2 bytes - timestamp format, in PPQN or SMPTE.
		If bit 15 is cleared, then 14-0 represent PPQN
		If bit 15 is set, then 14-8 represent negative SMPTE format
		and bits 7-0 represent the ticks per frame.
		SMPTE division is almost unheard-of in the wild.

Track Chunk

0E-11		Chunk type 'MTrk', 4 bytes
12-15		Data size, 4 bytes (BE), length of data from next byte onwards
16-		One or more MTrk events

MTrk event

Delta Timestamp <DT>	Variable Int	Number of ticks since previous
Event				Varies…		Channel Message, SysEx or Meta Event

Delta Timestamp is a 32-bit integer, max value 0FFFFFFF (not FFFFFFFF). It is encoded 7 bits per byte, MSB first, where MSB of each byte is reserved to indicate whether more bytes need to be read.

TO DO - more

Ableton-exported Sting clip (assuming 16-step sequence with no repeats)
=======================================================================
Raw:

    +0       0: * FF 03 "MIDI"
    +0       0:   90 28 7F
   +21      21:   80 28 40
    +3      24:   90 28 7F
    +6      30:   80 28 40
   +18      48:   90 20 7F
   +14      62:   80 20 40
   +10      72:   90 1B 50
    +6      78:   80 1B 40
   +18      96:   90 34 7F
   +24     120:   90 28 7F
    +2     122:   80 34 40
    +4     126:   80 28 40
   +18     144:   90 28 50
    +6     150:   80 28 40
   +18     168:   90 24 50
   +14     182:   80 24 40
   +10     192:   90 40 7F
   +14     206:   80 40 40
   +10     216:   90 10 7F
   +14     230:   80 10 40
   +10     240:   90 29 50
   +14     254:   80 29 40
   +10     264:   90 30 50
    +6     270:   80 30 40
   +18     288:   90 36 50
   +14     302:   80 36 40
   +10     312:   90 28 50
   +14     326:   80 28 40
   +10     336:   90 30 7F
   +24     360:   90 27 50
    +2     362:   80 30 40
   +12     374:   80 27 40

Events (example):

Index		Position	Length		Chan	Type		Parameter	Value	OffVal
1		2.2.00				—--	TrackName	MIDI
2		2.2.00		0.0.22		1	Note		E2		127	64
3		2.2.25		0.0.06		1	Note		E2		127	64
[etc. until]
17		3.1.75		0.0.15		1	Note		D#2		80	64
18		3.2.00				1	(end)NotesOff			0

Our first message is a Meta Event for Track Name:
FF 03 LL text   where LL is length. Ours: 00 FF 03 05 (length 5) then 4D 49 44 49 00 ("MIDI ") then another 00 that's maybe padding...or maybe a zero Delta Time?

Then 			FF 58 04 04 02 24 08 which is Time Signature...
Time Signature is  	FF 58 04 NN MM LL TT where NN is numerator, MM is denominator, LL is PPQN and TT is microseconds per quarter-note. There are 1,000,000 microseconds per second. 
Our denominator is 02, which according to this table means our tempo is 4/4 (numerator/denominator) and 2 quarter-notes per beat:



<table>
  <tr>
   <td>```

<code>MM</code>
   </td>
   <td><code>Time Signature Denominator</code>
   </td>
   <td><code>Quarter-Notes per Beat</code>
   </td>
  </tr>
  <tr>
   <td><code>00</code>
   </td>
   <td><code>1</code>
   </td>
   <td><code>4</code>
   </td>
  </tr>
  <tr>
   <td><code>01</code>
   </td>
   <td><code>2</code>
   </td>
   <td><code>2</code>
   </td>
  </tr>
  <tr>
   <td><code>02</code>
   </td>
   <td><code>4</code>
   </td>
   <td><code>1</code>
   </td>
  </tr>
  <tr>
   <td><code>03</code>
   </td>
   <td><code>8</code>
   </td>
   <td><code>1/2</code>
   </td>
  </tr>
  <tr>
   <td><code>04</code>
   </td>
   <td><code>16</code>
   </td>
   <td><code>1/4</code>
   </td>
  </tr>
  <tr>
   <td><code>MM</code>
   </td>
   <td><code>2<sup>MM</sup></code>
   </td>
   <td><code>2<sup>2-MM</sup></code>
   </td>
  </tr>
</table>



```
How useful this will be is unclear...
Ableton's exported clip repeats this entire message (plus 1 byte zero padding or zero Delta Time), perhaps in place of the Key Signature message which it presumably doesn't use?

Then we have a series of Channel Messages - Note On and Note Off.
Higher 4 bits represent message type (e.g. 8 for note off, 9 for note on), lower 4 bits represent channel 0-F.

Delta Time PRECEDES the note message, e.g. 
00 90 28 7F is our first event, zero delta, Note On channel 0, Note 28, Velocity 127
15 80 28 40 is our second event, 21 delta, Note Off channel 0, Note 28, Velocity 64

Delta Time can be variable length, and that involves a whole load of 32-bit integer encoding/decoding that shouldn't be necessary for us, since we're always dealing with deltas that should fit easily within a single byte.

Our last message is End Of Track, required as last event in a MTrck chunk:
FF 2F 00

So first we need to sum the MIDI track's delta times to give us the total duration (we don't care how that corresponds to ticks or samples), e.g. 374, divide that by 16 to get e.g. 23, and then we've got our step length.

Each Channel event (Note On or Note Off) should also have its own timestamp calculated; if it's a Note On, then we modulo that to see which step it falls into. If it's a Note Off, we modulo against duration/32 to determine whether the preceding Note On is a Tied note.

How do we work out Slide? We need to store the most recent Note On note value (this is a monophonic synth, after all), and if we get a Note Off whose note value does NOT match the most recent Note On note value, then we've got a Slide. Not entirely sure where to mark that. 

Sting 2022 by Iftah
===================

Sting is very good and I don't have the skill or motivation to improve upon (or even replicate) its conditional sequence randomising features, let alone decipher all that Max/MSP stuff, so I'll create a tool that parses its MIDI output and converts it to a .seq file that can be sent to the hardware via Synthtribe. After doing all the above reverse-engineering I found a web based thingy that someone made a few years ago for doing much the same thing directly, but I couldn't get it to work

Ignore:
	MIDI input
	Rate division (default 1/16)
	Swing
	Gate Length (?)
