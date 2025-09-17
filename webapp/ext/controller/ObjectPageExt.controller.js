sap.ui.define([
    "sap/m/MessageToast",
    'sap/ui/core/Fragment',
    "sap/m/Dialog",
    "sap/ui/core/mvc/Controller",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/MessageBox",
    "sap/m/TextArea"
], function (MessageToast, Fragment, Dialog, Controller, Button, ButtonType, MessageBox, TextArea) {
    'use strict';

    //Declaração Global do app    
    const
        c_openBusy = 'O',
        c_closeBusy = 'C';

    var sCentro;

    //Criar objeto para controle de espera de processamento do app        
    var _oBusyDialog = new sap.m.BusyDialog();

    return {

        onInit: function () {
            var that = this;
            this.extensionAPI.attachPageDataLoaded($.proxy(this.onPageLoaded, this));
            this.zoomLevel = 100; // Nível inicial de zoom            

        },

        onPageLoaded: function (oEvent) {
            //Caso esteja criando uma entidade...
            if (this.getView().getModel("ui").getProperty("/createMode")) {
                var sContexto = this.getView().getBindingContext(),
                    sPath = sContexto.getPath(),
                    sDeepPath = sContexto.sDeepPath,
                    sCentro = "",
                    sArte = "",
                    sRevisao = "",
                    sListDeepPath = [],
                    sMainPath = "";

                //Caso esteja criando uma dessas entidades, determina o centro da Arte como default
                if (sPath.includes("/ZPP_C_ARTEXMA_ROTO") || sPath.includes("/ZPP_C_ART_CONJUGADAS_ROTO")) {
                    //Obtem o Path da Entidade Principal
                    sListDeepPath = sDeepPath.split("/");
                    sMainPath = ("/" + sListDeepPath[1]);
                    //Obtem o Centro da Entitade Principal 
                    sCentro = sContexto.getProperty(sMainPath + "/Centro");
                    //Determina o centro da Arte como default
                    sContexto.getModel().setProperty(sPath + "/Centro", sCentro);
                    //Obtem a Arte da Entitade Principal 
                    sArte = sContexto.getProperty(sMainPath + "/CodArte");
                    //Determina a Arte como default
                    sContexto.getModel().setProperty(sPath + "/CodArte", sArte);
                    //Obtem a Revisão da Entitade Principal 
                    sRevisao = sContexto.getProperty(sMainPath + "/RevArte");
                    //Determina a Revisão da Arte como default
                    sContexto.getModel().setProperty(sPath + "/RevArte", sRevisao);                                     
                    //Altera Comentário na Criação
                    sContexto.getModel().setProperty(sMainPath + "/ComentarioModif", sPath);
                }
            }
        },

        onBeforeRebindTableExtension: function (oEvent) {
        },

        onAfterRendering: function () {
        },

        beforeLineItemDeleteExtension: function (oEvent) {
            var oModel = this.getView().getModel(),
                sPath = oEvent.aContexts[0].sPath,
                sDeepPath = oEvent.aContexts[0].sDeepPath,
                sListDeepPath = [],
                sMainPath = "";

            //Obtem o Path da Entidade Principal
            sListDeepPath = sDeepPath.split("/");
            sMainPath = ("/" + sListDeepPath[1]);

            //Altera Comentário na Eliminação
            oModel.setProperty(sMainPath + "/ComentarioModif", sPath);
        },

        // Função para abrir popup no botão de Salvar
        beforeSaveExtension: function () {
            var that = this;

            // Obtém o contexto do registro atual
            var oContext = this.getView().getBindingContext();

            // Se não houver contexto, assume que é novo
            if (!oContext) {
                return Promise.resolve(); // Continua sem popup
            }

            // Obtém o caminho do objeto no modelo OData v2
            var sPath = oContext.getPath();

            // Se o sPath contém 'id-' (ID temporário), então é um novo registro
            var bIsNew = sPath.includes("id-");

            if (bIsNew) {
                return Promise.resolve(); // Continua o salvamento SEM popup
            }

            return new Promise(function (resolve, reject) {
                var oTextArea = new TextArea({
                    width: "100%",
                    placeholder: that.getTxtI18n("placeholder"),
                    rows: 5
                });

                var oDialog = new Dialog({
                    title: that.getTxtI18n("confirmacao"),
                    type: "Message",
                    content: [oTextArea],
                    beginButton: new Button({
                        text: that.getTxtI18n("confirmar"),
                        press: function () {
                            var sComentario = oTextArea.getValue();
                            if (!sComentario) {
                                MessageToast.show(that.getTxtI18n("comentario"));
                                return;
                            }

                            // Salva o comentário no modelo
                            var oModel = that.getView().getModel();
                            var sComentarioOld = oModel.getProperty(sPath + "/ComentarioModif");
                            if (sComentario == sComentarioOld) {
                                sComentario = (sComentario + ".")
                            }
                            oModel.setProperty(sPath + "/ComentarioModif", sComentario);

                            oDialog.close();
                            resolve(); // Continua com o salvamento
                        }
                    }),
                    endButton: new Button({
                        text: that.getTxtI18n("cancelar"),
                        press: function () {
                            oDialog.close();
                            reject(); // Cancela o salvamento
                        }
                    })
                });

                oDialog.open();
            });
        },

        comCotas: function (oEvent) {

            let objSelected = oEvent.getSource().getBindingContext().getObject();

            let sRequest = '';

            let oModel = this.getView().getModel();

            sRequest = "/ZPP_I_ART_ARQUIVO_ROTO(p_matnr='" + objSelected.Matnr + "',p_tipo='COM')/Set";

            //Abrir o busy de processamento
            this.onBusyDialog(c_openBusy, 'txtAttachment');

            //Objeto para tratar Sucesso
            var oSuccessSubmit = function (OData, oResponse) {
                this.onBusyDialog(c_closeBusy, '');

                this._downloadFile(OData.results[0].filename, OData.results[0].minetype, OData.results[0].attachment);

                /*                 if (!this.oDefaultDialog) {
                                    this.oDefaultDialog = new Dialog({
                                        title: "Available Products",
                                        content: [
                                            new sap.m.Text({id: "textId", text: "A sample text that will be annoucned by JAWS after the title, when the dialog is opened."})
                                        ],
                                        beginButton: new Button({
                                            type: ButtonType.Emphasized,
                                            text: "OK",
                                            press: function () {
                                                this.oDefaultDialog.close();
                                            }.bind(this)
                                        }),
                                        endButton: new Button({
                                            text: "Close",
                                            press: function () {
                                                this.oDefaultDialog.close();
                                            }.bind(this)
                                        })
                                    });
                
                                    // to get access to the controller's model
                                    this.getView().addDependent(this.oDefaultDialog);
                                }
                
                                this.oDefaultDialog.open(); */

                /*                 if (!this.oDefaultDialog) {
                                    if (!this.oDefaultDialog) {
                //                        this.oDefaultDialog = sap.ui.xmlfragment("valgroup.com.zui5arteroto.ext.fragment.DialogDownload", this);
                                        this.oDefaultDialog = sap.ui.xmlfragment("ext.fragment.DialogDownload",this);
                                        this.getView().addDependent(this.oDefaultDialog);
                                    }
                                }
                                this.oDefaultDialog.open();
                 */
                //                Fragment.load({
                //                    id: "valgroup.com.zui5arteroto",
                //                    name: "valgroup.com.zui5arteroto.ext.fragment.DialogDownload",
                //                    controller: this,

                //                }).then(function (oFragment) {

                //Adiconar/Ancorar pop-up para Controller
                //                    this.oDefaultDialog = oFragment;
                //                    this.getView().addDependent(this.oDefaultDialog);

                //Exibir pop-up
                //                    this.oDefaultDialog.open();
                //                }.bind(this));
                //                this._downloadFile(OData.results[0].filename, OData.results[0].minetype, OData.results[0].attachment);

            }.bind(this);

            //Objeto para tratar erro
            var oErrorSubmit = function (oError) {
                this.onBusyDialog(c_closeBusy, '');
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

                MessageBox.error(oMsg);

            }.bind(this);

            oModel.read(sRequest, {
                success: oSuccessSubmit,
                error: oErrorSubmit
            })

        },

        semCotas: function (oEvent) {

            let objSelected = oEvent.getSource().getBindingContext().getObject();

            let sRequest = '';

            let oModel = this.getView().getModel();

            sRequest = "/ZPP_I_ART_ARQUIVO_ROTO(p_matnr='" + objSelected.Matnr + "',p_tipo='SEM')/Set";

            //Abrir o busy de processamento
            this.onBusyDialog(c_openBusy, 'txtAttachment');

            //Objeto para tratar Sucesso
            var oSuccessSubmit = function (OData, oResponse) {
                this.onBusyDialog(c_closeBusy, '');

                this._downloadFile(OData.results[0].filename, OData.results[0].minetype, OData.results[0].attachment);

            }.bind(this);

            //Objeto para tratar erro
            var oErrorSubmit = function (oError) {
                this.onBusyDialog(c_closeBusy, '');
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

                MessageBox.error(oMsg);

            }.bind(this);

            oModel.read(sRequest, {
                success: oSuccessSubmit,
                error: oErrorSubmit
            })

        },

        corACor: function (oEvent) {

            let objSelected = oEvent.getSource().getBindingContext().getObject();

            let sRequest = '';

            let oModel = this.getView().getModel();

            sRequest = "/ZPP_I_ART_ARQUIVO_ROTO(p_matnr='" + objSelected.Matnr + "',p_tipo='COR')/Set";

            //Abrir o busy de processamento
            this.onBusyDialog(c_openBusy, 'txtAttachment');

            //Objeto para tratar Sucesso
            var oSuccessSubmit = function (OData, oResponse) {
                this.onBusyDialog(c_closeBusy, '');

                this._downloadFile(OData.results[0].filename, OData.results[0].minetype, OData.results[0].attachment);

            }.bind(this);

            //Objeto para tratar erro
            var oErrorSubmit = function (oError) {
                this.onBusyDialog(c_closeBusy, '');
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

                MessageBox.error(oMsg);

            }.bind(this);

            oModel.read(sRequest, {
                success: oSuccessSubmit,
                error: oErrorSubmit
            })

        },

        _downloadFile: function (sFileName, sMineType, sRawFile) {
            if (sRawFile) {
                var that = this;
                var decodedFileContent = atob(sRawFile);
                var byteArray = new Uint8Array(decodedFileContent.length);
                for (var i = 0; i < decodedFileContent.length; i++) {
                    byteArray[i] = decodedFileContent.charCodeAt(i);
                }

                // Criar um Blob para o PDF
                var blob = new Blob([byteArray.buffer], { type: "application/pdf" });
                var pdfUrl = URL.createObjectURL(blob);
                jQuery.sap.addUrlWhitelist("blob");

                //Criar um HTML para exibir o PDF no Dialog
                var oPdfViewer = new sap.ui.core.HTML({
                    content: `<iframe width="100%" height="800px" style="border: none;" src="${pdfUrl}#toolbar=0&zoom=${this.zoomLevel}"></iframe>`
                });

                // Criar a caixa de diálogo
                this.oDefaultDialog = new Dialog({
                    title: "Visualizar PDF",
                    contentWidth: "150%",
                    contentHeight: "150%",
                    resizable: true,
                    content: [
                        new sap.m.Toolbar({
                            visible: true,
                            content: [
                                new sap.m.ToolbarSpacer(),
                                new sap.m.Button({
                                    icon: "sap-icon://zoom-in",
                                    press: function () {
                                        that.onZoomIn(that);
                                    }.bind(this),
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://zoom-out",
                                    press: function () {
                                        that.onZoomOut(that);
                                    }.bind(this),
                                })
                            ]
                        }),
                        new sap.m.VBox({
                            items: [oPdfViewer]
                        })
                    ],
                    endButton: new Button({
                        text: "Fechar",
                        press: function () {
                            that.zoomLevel = 100;
                            this.oDefaultDialog.close();
                        }.bind(this),
                    }),
                    afterClose: function () {
                        if (this.oDefaultDialog) {
                            this.oDefaultDialog.destroy(); // Destruir o dialog após fechar
                        }
                    }.bind(this)
                });

                // Adicionar o Dialog à View
                this.getView().addDependent(this.oDefaultDialog);
                this.oDefaultDialog.open();

            } else {
                MessageToast.show(this.getTxtI18n("txtAttErro"));
            }

/*
        // Mostra imagem
        _downloadFile: function (sFileName, sMineType, sRawFile) {

            if (sRawFile) {

                var decodedFileContent = atob(sRawFile);
                var byteArray = new Uint8Array(decodedFileContent.length);
                for (var i = 0; i < decodedFileContent.length; i++) {
                    byteArray[i] = decodedFileContent.charCodeAt(i);
                }
                var blob = new Blob([byteArray.buffer], {
                    type: sMineType,
                });
                var pdfurl = URL.createObjectURL(blob);
                jQuery.sap.addUrlWhitelist("blob");

                this.oDefaultDialog = new Dialog({
                    content: [
                        new sap.m.Image({
                            src: pdfurl,
                        }),
                    ],

                    //    beginButton: new Button({
                    //    type: ButtonType.Emphasized,
                    //    text: "OK",
                    //    press: function () {
                    //        this.oDefaultDialog.close();
                    //    }.bind(this),
                    //}),
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            this.oDefaultDialog.close();
                        }.bind(this),
                    }),
                });

                // to get access to the controller's model
                this.getView().addDependent(this.oDefaultDialog);
                //            }

                this.oDefaultDialog.open();

            } else {

                MessageToast.show(this.getTxtI18n("txtAttErro"));

            }
*/

/*
            // Download Arquivo
             try {

                var decodedFileContent = atob(sRawFile);
                var byteArray = new Uint8Array(decodedFileContent.length);
                for (var i = 0; i < decodedFileContent.length; i++) {
                    byteArray[i] = decodedFileContent.charCodeAt(i);
                }
                var blob = new Blob([byteArray.buffer], {
                    type: sMineType
                });
                var pdfurl = URL.createObjectURL(blob);
                jQuery.sap.addUrlWhitelist("blob")

                var a = document.createElement("a");
                document.body.appendChild(a);
                a.href = pdfurl;
                a.download = sFileName;
                a.click();
                //window.URL.revokeObjectURL(pdfurl);

            } catch {

            }

 */     },

        onBusyDialog: function (sAction, sNameTexT) {
            if (sAction == c_openBusy) {
                _oBusyDialog.setText(this.getTxtI18n(sNameTexT));
                _oBusyDialog.open();
            } else {
                _oBusyDialog.close();
            }
        },

        getTxtI18n: function (sName) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sName);
        },

        // Zoom + no PDF exibido
        onZoomIn: function (oEvent) {

            var that = this;
            // Aumenta o zoom em 10%
            this.zoomLevel += 10;
            setTimeout(function () { that.updateIframeZoom() }, 50);
        },

        // Zoom - no PDF exibido
        onZoomOut: function () {

            var that = this;
            // Diminui o zoom em 10%
            if (this.zoomLevel > 10) {
                this.zoomLevel -= 10;
                setTimeout(function () { that.updateIframeZoom() }, 50);
            }
        },

        updateIframeZoom: function (pThis) {

            // Obtém o iframe e atualiza o src com o novo nível de zoom
            var iframe = document.querySelector("iframe");
            if (iframe) {
                var newIframe = document.createElement("iframe"),
                    src = iframe.src.split("#")[0];

                newIframe.src = src + "#toolbar=0" + "&zoom=" + this.zoomLevel;
                newIframe.width = iframe.width;
                newIframe.height = iframe.height;
                newIframe.style = iframe.style;

                iframe.parentNode.replaceChild(newIframe, iframe); // Substitui o iframe antigo

                var sMsg = this.getTxtI18n("zoom");
                sMsg = sMsg.replace("&", this.zoomLevel);
                MessageToast.show(sMsg);                
            }
        }

    };
});