var http = require("http"),
    url = require("url"),
    xhr = require('node-xhr'),
    cheerio = require('cheerio');

http.createServer(function (request, response) {
    response.writeHead(200, {
        "Content-Type": "text/json",
        "Access-Control-Allow-Origin": "*"
    });

    var query = url.parse(request.url).query;

    if (null != query) {
        xhr.get({
            url: 'http://www.marmiton.org/recettes/recherche.aspx?' + query
        }, function (err, res) {
            if (err) {
                console.log(err.message);
                return;
            } else if (200 != res.status.code) {
                console.log(res.status);
                console.log(res.headers);
                return;
            }

            var $ = cheerio.load(res.body);

            var listeResultats = $('.m_resultats_liste_recherche > div');

            var result = [];
            listeResultats.each(function () {
                if (0 < $('.m_resultat_sponso', $(this)).length) {
                    return true; // Equivalent à un "continue;" dans une boucle classique
                }
                var titre = $('.m_titre_resultat > a', $(this));
                var titreValue = "<a target=\"_blank\" href=\"" + titre.attr('href') + "\">" + titre.html() + "</a>";

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
                    description: descriptionValue,
                    note: noteValue,
                    nbvote: nbVoteValue,
                    difficulte: difficulteValue,
                    prix: prixValue,
                    preparation: preparationValue,
                    cuisson: cuissonValue
                });
            });

            response.write(JSON.stringify(result));

            response.end();
        });
    }
}).listen(8888);