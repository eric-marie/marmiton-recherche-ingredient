(function ($) {
    var form = $('form[data-mri-form]'),
        inputIngredient = $('input[data-mri-ingredient]', form),
        inputTypeRepas = $('select[data-mri-type-repas]', form),
        resultContainer = $('div[data-mri-results]'),
        loadMoreBtn = $('button[data-mri-load-more]'),
        resultTemplateElement = $('div[data-mri-result-template]'),
        resultTemplate = resultTemplateElement.html();

    resultTemplateElement.remove();
    loadMoreBtn.hide();

    var typeRepas = {
        entree: "Entrée",
        platprincipal: "Plat principal",
        dessert: "Dessert",
        accompagnement: "Accompagnement",
        amusegueule: "Amuse gueule",
        boisson: "Boisson",
        confiserie: "Confiserie",
        sauce: "Sauce"
    };

    $.each(typeRepas, function (key, value) {
        var option = "<option value=\"" + key + "\">" + value + "</option>";
        inputTypeRepas.append(option);
    });

    $('input[data-mri-ingredient], select[data-mri-type-repas]').on('change', function() {
        loadMoreBtn.attr('data-mri-load-more-count', 0);
        loadMoreBtn.hide();
    });

    var loadResults = function () {
        var url = "http://localhost:8888?";
// Critère de recherche
        var ingredient = inputIngredient.val().replace(' ', '+').toLowerCase();
        url += "aqt=" + ingredient;
// Pour forcer la recherche dans les ingrédients
        url += "&st=1";
// Le type de plat
        var typeRepasSelected = inputTypeRepas.val();
        for (var key in typeRepasSelected) {
            if (typeRepasSelected.hasOwnProperty(key)) {
                url += "&dt=" + typeRepasSelected[key];
            }
        }
// Tri par nombre de votes décroissant
        url += "&sort=popularitydesc";
// Page (par 10 donc 0 => page 1, 10 => page 2, 20 => page 3, etc.)
        if(0 < parseInt(loadMoreBtn.attr('data-mri-load-more-count'))) {
            url += "&start=" + loadMoreBtn.attr('data-mri-load-more-count');
        }

        $.get(url, function (data) {
            if(0 < data.length) {
                if('0' == loadMoreBtn.attr('data-mri-load-more-count')) {
                    resultContainer.html('');
                }
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var ligneResultat = $(resultTemplate);

                        $('[data-mri-result-template-value="titre"]', ligneResultat).html(data[key].titre);
                        $('[data-mri-result-template-value="description"]', ligneResultat).html(data[key].description);

                        var noteElt = $('[data-mri-result-template-value="note"]', ligneResultat);
                        var note = '';
                        var iconStar = noteElt.attr('data-mri-result-template-star');
                        var iconStarEmpty = noteElt.attr('data-mri-result-template-star');
                        for (var i = 0; i < data[key].note; i++) {
                            note += '<i class="' + iconStar + '"></i>'
                        }
                        for (i = data[key].note; i < 5; i++) {
                            note += '<i class="' + iconStarEmpty + '"></i>'
                        }
                        noteElt.html(note);

                        $('[data-mri-result-template-value="nbvote"]', ligneResultat).html(' (sur ' + data[key].nbvote + ' votes)');
                        $('[data-mri-result-template-value="difficulte"]', ligneResultat).html('Difficulté : ' + data[key].difficulte);
                        $('[data-mri-result-template-value="prix"]', ligneResultat).html('Prix : ' + data[key].prix);
                        $('[data-mri-result-template-value="preparation"]', ligneResultat).html('Préparation : ' + data[key].preparation);
                        $('[data-mri-result-template-value="cuisson"]', ligneResultat).html('Cuisson : ' + data[key].cuisson);

                        resultContainer.append(ligneResultat);
                    }
                }
                var newOffset = parseInt(loadMoreBtn.attr('data-mri-load-more-count')) + 10;
                loadMoreBtn.attr('data-mri-load-more-count', newOffset);
            }
            if(10 == data.length) {
                loadMoreBtn.show();
            } else {
                loadMoreBtn.hide();
            }
        });
    };

    form.on('submit', function (e) {
        e.preventDefault();

        loadResults();
    });

    loadMoreBtn.on('click', function (e) {
        loadResults();
    });
})(jQuery);