module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    // server tests
    simplemocha: {
      options: {
        globals: ['expect', 'sinon'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },

      server: {
        src: ['test/spec_helper.spec.js', 'test/**/*.spec.js']
      }
    }
  });

  grunt.registerTask('test:server', ['simplemocha:server']);
}
