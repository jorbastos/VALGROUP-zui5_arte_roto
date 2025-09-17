sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller,MessageToast,JSONModel) {
    'use strict';

    //Declaração Global do app    
    var _createButton = false;

    return {

        onInit: function (oEvent) {
            var oModel   = this.getOwnerComponent().getModel(),
                that     = this,
                sRequest = '/ZPP_C_ART_USER_AUTHORITY';

            //Objeto para tratar o retorno sucesso
            var oSuccessRead = function (oDataReturn, oResponse) {
                try {
                    let sToolbar = that.getView().byId(that.getView().getId() + '--listReport').getToolbar();
            //Botão Create
                    sToolbar.getContent()[2].setProperty("visible", oDataReturn.results[0].createIsAllowed);                   
                } catch (error) {
                    
                }
            }.bind(this);

            //Objeto para tratar o retorno erro
            var oErrorRead = function (oResponse) {
            }.bind(this);

            oModel.read(sRequest, {
                success: oSuccessRead,
                error: oErrorRead
            })   

            //this.onInitialise();    
        },

        // enableCriar: async function (event) {
        //     let result,
        //     sRequest = '/ZPP_C_ART_USER_AUTHORITY',
        //     oModel = this.getOwnerComponent().getModel();
        //     try{
        //       result = await new Promise((success, error) => {
        //         oModel.read(sRequest, {
        //             success,
        //             error,
        //         }) 
        //       })
        //     } catch(exception){
        //         return;
        //     }
    
        //     return result.results[0].createIsAllowed;
        //   },

        // onInitialise: async function (event) {
        //     const enabled = await this.enableCriar();
    
        //     let sToolbar = this.getView().byId(this.getView().getId() + '--listReport').getToolbar();
        //     //Botão Create
        //     sToolbar.getContent()[2].setProperty("visible", enabled);             
        // },        

        getPredefinedValuesForCreateExtension: function(oSmartFilterBar){   
            var oRet = {};   
            var oSelectionVariant = oSmartFilterBar.getUiState().getSelectionVariant();   
            var aSelectOptions = oSelectionVariant.SelectOptions;   
            var fnTransfer = function(sFieldname){    
                for (var i = 0; i < aSelectOptions.length; i++){     
                    var oSelectOption = aSelectOptions[i];     
                    if (oSelectOption.PropertyName === sFieldname){      
                        if (oSelectOption.Ranges.length === 1){       
                            var oFilter = oSelectOption.Ranges[0];       
                            if (oFilter.Sign === "I" && oFilter.Option === "EQ"){        
                                oRet[sFieldname] = oFilter.Low;       
                            }      
                        }      
                        break;     
                    }    
                }   
            };     
            fnTransfer("Centro");     
            return oRet;  
        },

        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");

            // Pega o valor do filtro "Centro"
            var aFilters = oBindingParams.filters;
            var sCentro = "";
            
            aFilters.forEach(function (oFilter) {
                if (oFilter.sPath === "Centro") { // Substitua pelo nome correto do campo
                    sCentro = oFilter.oValue1;
                }
            });
        
            // Salva globalmente no Core
            sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({ filtroCentro: sCentro }), "FiltroModel");
            
        },

/*
        onInit: async function (evt) {

            await this.callOdata();

        },

        callOdata: async function () {

            let sRequest = '';

            let oModel = this.getOwnerComponent().getModel();

            let userInfo = sap.ushell.Container.getService("UserInfo").getId();

            userInfo = "MCESAR";

            sRequest = "/ZPP_I_ART_EDICAO_CONTROLE_ARTE('" + userInfo + "')";

            //Objeto para tratar Sucesso
            var oSuccessSubmit = function (OData, oResponse) {

                _createButton = true;

            }.bind(this);

            //Objeto para tratar erro
            var oErrorSubmit = function (oError) {

                var oMsg = "";
                try {
                    oMsg = JSON.parse(oError.responseText);
                    oMsg = oMsg.error.message.value;
                } catch (e) {
                    oMsg = oError.responseText;
                }

                if (oMsg === "") {
                    oMsg = "Erro inesperado!"
                }

//                MessageBox.error(oMsg);

            }.bind(this);


            var performSynchronousRead = async function (
                oModel,
                sRequest
              ) {
                return new Promise((resolve, reject) => {
                  oModel.read(sRequest, {
                    success: oSuccessSubmit,
                    error: oErrorSubmit,
                  });
                });
              };

              var data = await performSynchronousRead(
                oModel,
                sRequest
              );
  

            oModel.read(sRequest, {
                success: oSuccessSubmit,
                error: oErrorSubmit
            })

        },
*/
        // Função para tratar o botão de criação
        onAfterRendering: function () {

//             let sRequest = '';

//             let oModel = this.getOwnerComponent().getModel();

//             let userInfo = sap.ushell.Container.getService("UserInfo").getId();

//             sRequest = "/ZPP_I_ART_EDICAO_CONTROLE_ARTE('" + userInfo + "')";

//             //Objeto para tratar Sucesso
//             var oSuccessSubmit = function (OData, oResponse) {

//                 _createButton = true;

//                 this.buttonCreate();

//             }.bind(this);

//             //Objeto para tratar erro
//             var oErrorSubmit = function (oError) {

//                 this.buttonCreate();

//                 var oMsg = "";
//                 try {
//                     oMsg = JSON.parse(oError.responseText);
//                     oMsg = oMsg.error.message.value;
//                 } catch (e) {
//                     oMsg = oError.responseText;
//                 }

//                 if (oMsg === "") {
//                     oMsg = "Erro inesperado!"
//                 }

// //                MessageBox.error(oMsg);

//             }.bind(this);

//             oModel.read(sRequest, {
//                 success: oSuccessSubmit,
//                 error: oErrorSubmit
//             })

        },

        buttonCreate: function(){

            if (_createButton == false) {

                //Obter toolbar object page
                let oToolBar = this.getView().byId("valgroup.com.zui5arteroto::sap.suite.ui.generic.template.ListReport.view.ListReport::ZPP_C_MAIN_REPORT--template::ListReport::TableToolbar");
                if (oToolBar) {

                    let content = oToolBar.getContent( );

                    for (let i = 0; i < content.length; i++) {
                        //Verifica se é o botão de criação
                        if (content[i].sId == "valgroup.com.zui5arteroto::sap.suite.ui.generic.template.ListReport.view.ListReport::ZPP_C_MAIN_REPORT--addEntry") {

                            content[i].setVisible(false);

                        }
                    }
                }

            }
        }

    };
});