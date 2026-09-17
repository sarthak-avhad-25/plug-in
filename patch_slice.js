const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const targetWW = `                      {trendingWorldwide.map((song, index) => (
                      <SongBox`;
const replaceWW = `                      {trendingWorldwide.slice(0, 10).map((song, index) => (
                      <SongBox`;

const targetIN = `                      {trendingIndia.map((song, index) => (
                      <SongBox`;
const replaceIN = `                      {trendingIndia.slice(0, 10).map((song, index) => (
                      <SongBox`;

code = code.replace(targetWW, replaceWW).replace(targetIN, replaceIN);
fs.writeFileSync('src/app/page.tsx', code);
