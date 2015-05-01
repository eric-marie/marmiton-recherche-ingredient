var http = require('http'),
    url = require('url'),
    xhr = require('node-xhr'),
    cheerio = require('cheerio');

http.createServer(function (request, response) {
    response.writeHead(200, {
        "Content-Type": "text/json",
        "Access-Control-Allow-Origin": "*"
    });

    var marmitonUrl = 'http://www.marmiton.org';

    var searchReceipts = function (url, redirectCount) {
        console.log(url);
        xhr.get({
            url: url
        }, function (err, res) {
            if (err) {
                console.log(err.message);
                response.write('[]');
                response.end();
                return;
            } else if (200 != res.status.code) {
                if (301 == res.status.code && 5 >= redirectCount) {
                    searchReceipts(marmitonUrl + res.headers.location, ++redirectCount);
                    return;
                }
                console.log(res.status);
                console.log(res.headers);
                response.write('[]');
                response.end();
                return;
            }

            var $ = cheerio.load(res.body);

            var regexResult = /(\d*)\s\/\s(\d*)/.exec($('.m_resultats_recherche_titre').html()),
                count = regexResult[1],
                total = regexResult[2];

            var listeResultats = $('.m_resultats_liste_recherche > div');

            var result = [];
            listeResultats.each(function () {
                if (0 < $('.m_resultat_sponso', $(this)).length) {
                    return true; // Equivalent à un "continue;" dans une boucle classique
                }
                var titre = $('.m_titre_resultat > a', $(this));
                var titreValue = titre.html();
                var lienValue = 'http://www.marmiton.org' + titre.attr('href');

                var temps = $('.m_detail_time > div', $(this));

                var preparation = $(temps[0]);
                $('.m_prep_time', preparation).remove();
                var preparationValue = preparation.html();

                var cuisson = $(temps[1]);
                $('.m_cooking_time', cuisson).remove();
                var cuissonValue = cuisson.html();

                var description = $('.m_texte_resultat', $(this));
                var descriptionValue = description.html();

                var detail = $('.m_detail_recette', $(this)).html();
                var detailSplited = detail.split(' - ');
                var difficulteValue = detailSplited[2];
                var prixValue = detailSplited[3];

                var noteValue = $('.m_note_resultat > .m_recette_note1', $(this)).length;

                var nbVote = $('.m_note_resultat > .m_recette_nb_votes', $(this));
                var nbVoteHtml = nbVote.html();
                var nbVoteSplited = nbVoteHtml.substring(1, nbVoteHtml.length - 1).split(' ');
                var nbVoteValue = nbVoteSplited[0];

                result.push({
                    titre: titreValue,
                    lien: lienValue,
                    description: descriptionValue,
                    note: noteValue,
                    nbvote: nbVoteValue,
                    difficulte: difficulteValue,
                    prix: prixValue,
                    preparation: preparationValue,
                    cuisson: cuissonValue
                });
            });

            response.write(JSON.stringify({count: count, total: total, result: result}));
            response.end();
        });
    };
    var selectOption = function () {
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

        var selectOptions = [];
        for (var index in typeRepas) {
            if (typeRepas.hasOwnProperty(index)) {
                selectOptions.push("<option value=\"" + index + "\">" + typeRepas[index] + "</option>");
            }
        }

        response.write(JSON.stringify(selectOptions));
        response.end();
    };

    var parsedUrl = url.parse(request.url);
    var query = parsedUrl.query;
    if ('/select-options' == parsedUrl.pathname) {
        selectOption();
    } else if ('/' == parsedUrl.pathname && null != query) {
        searchReceipts(marmitonUrl + '/recettes/recherche.aspx?' + query, 0)
    } else {
        response.write('[]');
        response.end();
    }
}).listen(8888);