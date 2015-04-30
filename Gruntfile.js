module.exports = function (grunt) {
    'use strict';

    //----- Force l'utilisation du retour à la ligne d'Unix
    grunt.util.linefeed = '\n';

    //----- Configuration du projet
    grunt.initConfig({
        // Configuration des chemins de fichiers
        dirs: {
            root: './',
            src: '<%= dirs.root %>src/',
            dist: '<%= dirs.root %>dist/'
        },

        //----- Descriptif des différentes tâches
        // Installation des dépendences par Bower
        bower: {
            install: {}
        },
        // Concaténation et obfuscation des fichiers js
        uglify: {
            options: {
                preserveComments: false
            },
            mri: {
                files: {
                    '<%= dirs.dist %>mri.min.js': [
                        '<%= dirs.src %>mri.js'
                    ]
                }
            }
        },
        // Ecoute la modification des fichiers js pour lancer les tâches associées
        watch: {
            js: {
                files: [
                    '<%= dirs.src %>*.js',
                    '<%= dirs.src %>*/*.js'
                ],
                tasks: [
                    'uglify'
                ]
            }
        }
    });

    //----- Charge les tâches grunt
    require('load-grunt-tasks')(grunt);

    //----- Groupement des tâches en un appel
    grunt.registerTask('default', ['bower', 'uglify']);
    grunt.registerTask('watch', ['watch']);
};