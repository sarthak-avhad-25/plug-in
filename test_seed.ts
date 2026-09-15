const ARTISTS = [
  "The Weeknd", "Taylor Swift", "Drake", "Bad Bunny", "Ed Sheeran", "Justin Bieber", "Dua Lipa", "Coldplay",
  "Ariana Grande", "Post Malone", "Imagine Dragons", "Eminem", "Billie Eilish", "Katy Perry", "Bruno Mars",
  "Maroon 5", "Rihanna", "Travis Scott", "Kendrick Lamar", "SZA", "Doja Cat", "Olivia Rodrigo", "Harry Styles",
  "Adele", "Beyonce", "Lady Gaga", "Shakira", "J Balvin", "Karol G", "Rosalia", "The Chainsmokers", "Calvin Harris"
];

const seed = Math.floor(Date.now() / (6 * 60 * 60 * 1000));
console.log("Current Seed (Changes every 6 hours):", seed);

// Simple seeded shuffle or shift
const offset = (seed * 6) % ARTISTS.length;
const selected = [];
for (let i = 0; i < 6; i++) {
  selected.push(ARTISTS[(offset + i) % ARTISTS.length]);
}
console.log("Selected Artists:", selected);
