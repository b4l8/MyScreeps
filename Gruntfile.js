module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy')
    //grunt.loadNpmTasks('grunt-file-append')

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
        concat: {
            // Merge together additions to the default game objects into one file
            configs: {
                src: ['release/config.js','release/config_*.js','release/prototype_*.js',
                'src/role/lorry.js','src/role/upgrader.js','src/role/miner.js','src/role/harvester.js'],
                dest: 'dist/prototypes_packaged.js',
            }

            // // Merge ScreepsOS into a single file in the specified order
            // sos: {
            //     options: {
            //         banner: "var skip_includes = true\n\n",
            //         separator: "\n\n\n",
            //     },
            //     // Do not include console! It has to be redefined each tick
            //     src: ['dist/sos_config.js', 'dist/sos_interrupt.js', 'dist/sos_process.js', 'dist/sos_scheduler.js', 'dist/sos_kernel.js'],
            //     dest: 'dist/_sos_packaged.js',
            // },
        },

        // Copy all source files into the dist folder, flattening the folder
        // structure by converting path delimiters to underscores
        copy: {
            release: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'release/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize underscores for folders
                        return dest + src.replace(/\//g,'_');
                    }
                }]
            },
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'release/',
                    src: ['main.js','utils.js','constants.js','logging.js'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            },
        },
        // Clean the dist folder.
        clean: {
            'dist': ['dist'],
            'release': ['release']
        },

        // uglify: {
        //     my_target: {
        //         options: {
        //             compress: {
        //                 global_defs: {
        //                     'MINIFIED': true,
        //                 },
        //                 dead_code: true,
        //             },
        //         },
        //         files: {
        //             'dist/main.js': [
        //                 'src/config.js',
        //                 'src/config_local.js',
        //                 'src/config_logging.js',
        //                 'src/config_brain_memory.js',
        //                 'src/config_brain_nextroom.js',
        //                 'src/config_brain_squadmanager.js',
        //                 'src/config_creep.js',
        //                 'src/config_creep_resources.js',
        //                 'src/config_creep_fight.js',
        //                 'src/config_creep_harvest.js',
        //                 'src/config_creep_mineral.js',
        //                 //            'src/config_creep_move.js',
        //                 'src/config_creep_routing.js',
        //                 //            'src/config_creep_startup_tasks.js',
        //                 'src/config_roomPosition_structures.js',
        //                 'src/config_room.js',
        //                 'src/config_room_basebuilder.js',
        //                 'src/config_room_controller.js',
        //                 'src/config_room_defense.js',
        //                 'src/config_room_market.js',
        //                 'src/config_room_mineral.js',
        //                 'src/config_room_not_mine.js',
        //                 'src/config_room_external.js',
        //                 'src/config_room_flags.js',
        //                 'src/config_room_routing.js',
        //                 'src/config_room_wallsetter.js',
        //                 'src/config_string.js',
        //                 'src/main.js',
        //             ],
        //         },
        //     },
        // },

        eslint: {
            check: {
                src: 'src/*.js',
            },
            fix: {
                src: 'src/*.js',
                options: {
                    fix: true,
                },
            },
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

    grunt.registerTask('package', ['clean:release', 'copy:release','clean:dist','concat','copy:screeps']);
    grunt.registerTask('default', ['clean:release', 'copy:release','clean:dist','concat','copy:screeps','screeps']);
};