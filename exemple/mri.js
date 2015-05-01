(function ($) {
// Eléments de l'IHM
    var form = $('form[data-mri-form]'),
        inputIngredient = $('input[data-mri-ingredient]', form),
        inputTypeRepas = $('select[data-mri-type-repas]', form),
        inputVegetarien = $('input[data-mri-vegetarien]', form),
        resultContainer = $('div[data-mri-results]'),
        loadMoreBtn = $('button[data-mri-load-more]'),
        resultTemplate = '';

    var mriServer = 'http://localhost:8888/',
        iconStar = 'glyphicon glyphicon-star',
        iconStarEmpty = 'glyphicon glyphicon-star-empty';

    var pageActuelle = 1;

// On masque le bouton au début
    loadMoreBtn.hide();
// Et on rend le formulaire inopérant avant le chargement des contenus nécessaires
    form.on('submit', function (e) {
        e.preventDefault();
    });

    /*
     * Gestion des prérequis à télécharger
     */
// D'abord on récupère le template de résultat
    $.get(window.location.origin + window.location.pathname + 'result-template.html', function (htmlContent) {
        resultTemplate = htmlContent;
        $('body').trigger('mri:template-ok');
    });

// Ainsi que les <option>s du <select> de type de repas
    $.get(mriServer + 'select-options', function (selectOptions) {
        for (var i = 0; i < selectOptions.length; i++) {
            inputTypeRepas.append(selectOptions[i]);
        }
        $('body').trigger('mri:select-options-ok');
    });

// Ensuite on gère les évènements générés
    var templateOk = false,
        selectOptionOk = false;
    $('body').on('mri:template-ok', function () {
        templateOk = true;
        if (selectOptionOk) {
            $('body').trigger('mri:all-ok');
        }
    }).on('mri:select-options-ok', function () {
        selectOptionOk = true;
        if (templateOk) {
            $('body').trigger('mri:all-ok');
        }
    }).on('mri:all-ok', function () {
// Quand tout est ok, on ajoute les événements permettant la recherche
        var loadResults = function () {
            var resultats = recupereResultats(inputIngredient.val(), inputTypeRepas.val(), inputVegetarien.is(':checked'), pageActuelle);
            afficheResultat(resultats);
            pageActuelle++;
        };

        form.on('submit', function (e) {
            e.preventDefault();
            loadResults();
        });

        loadMoreBtn.on('click', function () {
            loadResults();
        });

// Reset de la page actuelle si on change les valeurs du formulaire
        inputIngredient.on('change', function () {
            pageActuelle = 1;
        });
        inputTypeRepas.on('change', function () {
            pageActuelle = 1;
        });
        inputVegetarien.on('change', function () {
            pageActuelle = 1;
        });
    });

    /**
     * Construit la requête et retourne les résultats
     *
     * @param ingredients string
     * @param typeRepas
     * @param vegetarien boolean
     * @param page integer
     * @returns {*}
     */
    var recupereResultats = function (ingredients, typeRepas, vegetarien, page) {
        var url = mriServer + '?';
        var queryParts = [];
// Critère de recherche
        ingredients = ingredients.replace(' ', '+').toLowerCase();
        if ('' != ingredients) {
            queryParts.push('aqt=' + ingredients);
// Pour forcer la recherche dans les ingrédients
            queryParts.push('st=1');
        }
// Pour trier pour les plats végétariens
        if (vegetarien) {
            queryParts.push('veg=1');
        }
// Le type de plat
        for (var key in typeRepas) {
            if (typeRepas.hasOwnProperty(key)) {
                queryParts.push('dt=' + typeRepas[key]);
            }
        }
// Tri par nombre de votes décroissant
        queryParts.push('sort=popularitydesc');
// Page (par 10 donc 0 => page 1, 10 => page 2, 20 => page 3, etc.)
        var decalage = (page - 1) * 10;
        if (0 < decalage) {
            queryParts.push('start=' + decalage);
        }

        url = url + queryParts.join('&');

        return $.ajax({
            type: 'GET',
            url: url,
            global: false,
            async: false
        }).responseJSON;
    };

    /**
     * Affiche les résultats obtenus dans la page
     *
     * @param resultats
     */
    var afficheResultat = function (resultats) {
        if (1 == pageActuelle) {
            resultContainer.html('');
        }
        console.log(resultats);

        $('[data-mri-count]').html(resultats.count + ' / ' + resultats.total);

        for (var i = 0; i < resultats.result.length; i++) {
            var note = parseInt(resultats.result[i].note);
            resultats.result[i].note = '';
            for (var j = 0; j < note; j++) {
                resultats.result[i].note += '<i class="' + iconStar + '"></i>';
            }
            for (j = 0; j < 5 - note; j++) {
                resultats.result[i].note += '<i class="' + iconStarEmpty + '"></i>';
            }
            resultContainer.append(Mustache.render(resultTemplate, resultats.result[i]));
        }

        if (resultats.count != resultats.max) {
            loadMoreBtn.show();
        } else {
            loadMoreBtn.hide();
        }
    }
})(jQuery);