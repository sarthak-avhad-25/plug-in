const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf-8');

const target = `      <body className="min-h-full flex flex-col">{children}</body>`;
const replacement = `      <body className="min-h-full flex flex-col">
        {children}
        <script dangerouslySetInnerHTML={{ __html: \`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
              });
            });
          }
        \`}} />
      </body>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/layout.tsx', code);
