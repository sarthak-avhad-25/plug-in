const m = {
    name: 'Plug In',
    short_name: 'Plug In',
    description: 'Your personal music hub',
    start_url: '/',
    display: 'standalone',
    display_override: ['fullscreen', 'standalone'],
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
console.log(m);
