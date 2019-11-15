module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-file-append')

    grunt.initConfig({
        screeps: {
            options: {
                email: '',
                password: '',
                branch: 'sim',
                ptr: false
            },
            dist: {
                src: ['dist/*.js']
            }
        },

        // Combine groups of files to reduce the calls to 'require'
        // concat: {
        //     // Merge together additions to the default game objects into one file
        //     extends: {
        //         src: ['dist/extend_*.js'],
        //         dest: 'dist/_extensions_packaged.js',
        //     },
        //
        //     // Merge ScreepsOS into a single file in the specified order
        //     sos: {
        //         options: {
        //             banner: "var skip_includes = true\n\n",
        //             separator: "\n\n\n",
        //         },
        //         // Do not include console! It has to be redefined each tick
        //         src: ['dist/sos_config.js', 'dist/sos_interrupt.js', 'dist/sos_process.js', 'dist/sos_scheduler.js', 'dist/sos_kernel.js'],
        //         dest: 'dist/_sos_packaged.js',
        //     },
        // },

        // Copy all source files into the dist folder, flattening the folder
        // structure by converting path delimiters to underscores
        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize underscores for folders
                        return dest + src.replace(/\//g,'_');
                    }
                }]
            },
        },
        // Clean the dist folder.
        clean: {
            'dist': ['dist']
        },

        // Add variable to mark this as packaged.
        file_append: {
            default_options: {
                files: [
                    {
                        prepend: "'use strict';\nglobal.GRUNT_PACKAGE=true\n",
                        input: 'dist/main.js',
                    }
                ]
            }
        },
    });

    grunt.registerTask('package', ['clean', 'copy', 'file_append']);
    grunt.registerTask('default', ['clean', 'copy', 'file_append', 'screeps']);
};