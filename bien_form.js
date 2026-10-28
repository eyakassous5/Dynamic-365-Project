var ImmoTunis = ImmoTunis || {};
ImmoTunis.Bien = (function () {
    "use strict";

    // Valeurs des choix de "Statut du Bien" (à vérifier chez vous)
    var STATUT = {
        DISPONIBLE: 555550000,
        SOUS_OFFRE: 555550001,
        VENDU: 555550002,
        RETIRE: 555550003
    };

    var NOTIF_ID = "bien_indisponible";

    function verrouiller(formContext) {
        var attrStatut = formContext.getAttribute("eya_statutdubien");
        if (!attrStatut) { return; }

        var statut = attrStatut.getValue();
        var bloque = (statut === STATUT.VENDU || statut === STATUT.RETIRE);

        ["eya_prixdemande", "eya_agentresponsable"].forEach(function (nom) {
            var ctrl = formContext.getControl(nom);
            if (ctrl) { ctrl.setDisabled(bloque); }
        });

        if (bloque) {
            formContext.ui.setFormNotification(
                "Ce bien n'est plus disponible, modification impossible",
                "WARNING",
                NOTIF_ID
            );
        } else {
            formContext.ui.clearFormNotification(NOTIF_ID);
        }
    }

    return {
        onLoad: function (executionContext) {
            verrouiller(executionContext.getFormContext());
        },
        onChangeStatut: function (executionContext) {
            verrouiller(executionContext.getFormContext());
        }
    };
})();