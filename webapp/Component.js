sap.ui.define([
    "sap/suite/ui/generic/template/lib/AppComponent",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (AppComponent, UIComponent, JSONModel) {
    "use strict";

    return AppComponent.extend("valgroup.com.zui5arteroto.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            console.log("Component.js INIT chamado!"); // Verificar se o Component está sendo carregado
            
            // Chama a função init da superclasse correta
            UIComponent.prototype.init.apply(this, arguments);

            // Criamos um modelo JSON global para armazenar o valor do filtro "Centro"
            var oFiltroModel = new JSONModel({ filtroCentro: "" });

            // Definimos o modelo globalmente no componente
            this.setModel(oFiltroModel, "FiltroModel");

            // Teste: Verifique se o modelo foi realmente criado
            console.log("Modelo FiltroModel:", this.getModel("FiltroModel").getData());
        }
    });
});
