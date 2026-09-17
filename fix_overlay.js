const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

const target = `      </div>

    </div>
  );
}`;

const replacement = `      </div>

      {/* MOBILE SCREEN OFF OVERLAY */}
      <AnimatePresence>
        {isScreenOff && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none"
            onPointerDown={handleScreenOffPointerDown}
            style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
          >
            <AnimatePresence>
              {showScreenOffText && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white/30 text-sm font-bold tracking-widest uppercase pointer-events-none"
                >
                  Double tap to wake
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
