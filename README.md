# Pit Board Link

The phone side of FRC 5459's pit display board: a web page that sends the board its event data
over Bluetooth LE — no Wi-Fi needed in the pit. The phone fetches The Blue Alliance (and Nexus)
on its own data and writes a compact copy to the board.

Open **https://wifijt.github.io/pitboard-phone/** in Chrome on Android (or the Bluefy browser on
an iPhone), enter a TBA read key once (it stays on the phone), press *Connect to the board*, then
*Send now* or *every minute*.

This page holds no keys or secrets. It's published from `phone/` in the board's own repo.
