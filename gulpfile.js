const fs = require('fs');

const { task, watch } = require('gulp');

task('hbs', function watchHandlebars() {
  watch(['views/**/*.hbs']).on('change', () => {
    console.log('Restarting Nest');
    const path = './src/main.ts';
    fs.utimesSync(path, new Date(), new Date());
  });
});
