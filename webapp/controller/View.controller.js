sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/TablePersoController",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/ui/model/odata/ODataModel",
	"sap/m/ColumnListItem",
	"sap/m/MessageStrip"
], function(Controller, TablePersoController, MessageBox, Text, oDataModel, ColumnListItem, MessageStrip) {
	"use strict";

	return Controller.extend("ZECOMBPOST.controller.View", {
		Hunr: "",
		exidv: "false",
		onInit: function() {

			//var oThis = this;
			// set explored app's demo model on this sample
			// init and activate controller
			/*this._oTPC = new TablePersoController({
				table: oThis.getView().byId("EANTable"),
				componentName: "tableperso",
				persoService: DemoPersoService
			});*/
		},

		toNRSearch: function(evt) {
			var oController = this;
			var oView = this.getView();
			var tonr = evt.getSource().getValue();
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
			var oData = new oDataModel(sServiceUrl, true);
			var query = "/CheckToSet('" + tonr + "')";
			oData.read(query, null, null, true, function(response) {
				if (response.Type === "E") {
					oView.byId("tonr").setValue("");
					MessageBox.error(response.Message, {
						title: "Error"
					});
				} else {
					oView.byId("tonr").setEnabled(false);
					if (response.Exidv !== "") {
						MessageBox.information(response.Message, {
							title: "Information",
							onClose: function() {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("scanEAN").focus();
								});
								oController.Hunr = response.Zinhalt;
								oView.byId("selectingBox").setValue(response.ZMatnr);
								oView.byId("boxId").setText(response.Exidv);
								oView.byId("scanEAN").setEnabled(true);
								oView.byId("fButton1").setVisible(true);
								oView.byId("fButton2").setVisible(true);
								oView.byId("fButton3").setVisible(true);
							}
						});
					} else {
						oView.byId("selectingBox").setEnabled(true);
						jQuery.sap.delayedCall(500, this, function() {
							oView.byId("selectingBox").focus();
						});
					}
					oView.byId("appid").bindElement({
						path: "/CheckToSet('" + tonr + "')",
						model: "ECOMBPOST",
						parameters: {
							expand: "TOtoItemsNav"
						}
					});
					var oTemplate = new ColumnListItem({
						cells: [
							new Text({
								text: "{ECOMBPOST>Gtin}"
							}),
							new Text({
								text: "{ECOMBPOST>Maktx}"
							}),
							new Text({
								text: "{ECOMBPOST>Tanum}"
							}),
							new Text({
								text: "{ECOMBPOST>Meins}"
							}),
							new Text({
								text: "{ECOMBPOST>ZQtyOriginal}"
							}),
							new Text({
								text: "{ECOMBPOST>ZQtyPicking}"
							}),
							new Text({
								text: "{ECOMBPOST>Stat}"
							}),
							new Text({
								text: "{ECOMBPOST>ZQtyPack}"
							}),
							new Text({
								text: "{ECOMBPOST>ZQtyDefect}"
							}),
							new Text({
								text: "{ECOMBPOST>Exidv}"
							}),
							new Text({
								text: "{ECOMBPOST>ZPackSpec}"
							}),
							new Text({
								text: "{ECOMBPOST>Vltyp}"
							}),
							new Text({
								text: "{ECOMBPOST>Vlpla}"
							}),
							new Text({
								text: "{ECOMBPOST>ZUserPacked}"
							}),
							/*new Text({
								text: "{ECOMBPOST>ZDatePacked}"
							}),*/
							new Text({
								text: {
									path: 'ECOMBPOST>ZDatePacked',
									type: 'sap.ui.model.type.Date',
									formatOptions: {
										pattern: 'MM/dd/yyyy'
									}
								}
							}),

							new Text({
								text: {
									path: 'ECOMBPOST>ZTimePacked/ms',
									type: 'sap.ui.model.type.Time',
									formatOptions: {
										source: {
											pattern: 'timestamp'
										},
										pattern: 'HH:mm:ss'
									}
								}
							}),
							new Text({
								text: "{ECOMBPOST>Matnr}"
							}),
							new Text({
								text: "{ECOMBPOST>ZMatnr}"
							})
						]
					});
					oView.byId("EANTable").bindItems({
						path: "ECOMBPOST>/CheckToSet('" + oView.byId("tonr").getValue() + "')/TOtoItemsNav",
						template: oTemplate
					});
					oController.highlightRedTable();
				}
			}, function(error) {
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		highlightRedTable: function(evt) {
			var oController = this;
			var oTable = this.getView().byId("EANTable");
			oTable.attachUpdateFinished(function() {
				this.getItems().forEach(function(row) {
					var obj = row.getBindingContext("ECOMBPOST").getObject();
					if (obj.ZQtyPicking === "0") {
						row.$().addClass("rede");
					}
				});
				oController.checkAllPicked();
			}.bind(oTable));
		},

		keyPress: function(evt) {
			evt.getSource().attachBrowserEvent("keydown", function(e) {
				var key_codes = [112, 113, 114, 115, 118, 120];
				if (!($.inArray(e.which, key_codes) >= 0)) {
					/*switch(key_codes){
					case 114:
						oController.F3(evt);
					}*/
				}
			});
		},

		selectingBoxSearch: function(evt) {
			var oController = this;
			var oView = this.getView();
			var box = evt.getSource().getValue();
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
			var oData = new oDataModel(sServiceUrl, true);
			var query = "/BPostScanSet(ZMatnr='" + box + "',Tanum='" + oView.byId("tonr").getValue() + "')";
			oData.read(query, null, null, true, function(response) {
				if (response.Message === "OK") {
					oController.Hunr = response.Exidv;
					oView.byId("boxId").setText(response.Hunr);
					oView.byId("selectingBox").setEnabled(false);
					oView.byId("scanEAN").setEnabled(true);
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("scanEAN").focus();
					});
					oView.byId("fButton1").setVisible(true);
					oView.byId("fButton2").setVisible(true);
					oView.byId("fButton3").setVisible(true);
					oView.byId("EANTable").getModel("ECOMBPOST").refresh();
					oController.highlightRedTable();
				} else {
					MessageBox.error(response.Message, {
						title: "Error"
					});
				}
			}, function(error) {
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		scanEANSearch: function(evt) {
			var oController = this;
			var oView = this.getView();
			var ean = evt.getSource().getValue();
			var box = oView.byId("selectingBox").getValue();
			var defect = '0';
			if (oView.byId("defectContainer").getVisible() === true) {
				defect = '1';
				oView.byId("defectContainer").setVisible(false);
			}
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
			var oData = new oDataModel(sServiceUrl, true);
			var query = "/EANCheckSet(Ean='" + ean +
				"',ZMatnr='" + box +
				"',Tanum='" + oView.byId("tonr").getValue() +
				"',Exidv='" + this.Hunr +
				"',Hunr='" + oView.byId("boxId").getText() +
				"',Defect='" + defect +
				"')";
			evt.getSource().setValue("");
			oData.read(query, null, null, true, function(response) {
				if (response.Message === 'OK') {
					oView.byId("EANTable").getModel("ECOMBPOST").refresh();
					oController.highlightRedTable();
				} else {
					MessageBox.error(response.Message, {
						title: "Error"
					});
				}
			}, function(error) {
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		PressNewbox: function(evt) {
			this.backToBox();
			this.checkAllPicked();
		},

		PressEndTo: function() {
			var oController = this;
			var oView = this.getView();
			var msg = "All materials packed for TO " + oView.byId("tonr").getValue() + "?";
			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/OperationSet(Action='9',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Hunr +
							"')";
						oData.read(query, null, null, true, function(response) {
							if (response.Message === "OK") {
								oController.backToBox();
								/*oView.byId("EANTable").getModel("ECOMBPOST").refresh();
								oController.highlightRedTable();*/
								oView.byId("appid").unbindElement();
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("tonr").focus();
								});
							}
						}, function(error) {
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						});
					}
				}
			});
		},

		PressCancelPacking: function(evt) {
			var oController = this;
			var oView = this.getView();
			var msg = "Are you sure you want to delete the ongoing packing " + oController.Hunr + "?";
			//var oView = this.getView();
			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/OperationSet(Action='3',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Hunr +
							"')";
						oData.read(query, null, null, true, function(response) {
							if (response.Message === "OK") {
								oController.backToBox();
								/*oView.byId("selectingBox").setEnabled(true);
								oView.byId("selectingBox").setValue("");
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("selectingBox").focus("");
								});
								oView.byId("boxId").setText("");
								oView.byId("scanEAN").setEnabled(false);
								oView.byId("scanEAN").setValue("");
								oView.byId("fButton1").setVisible(false);
								oView.byId("fButton2").setVisible(false);
								oView.byId("fButton3").setVisible(false);*/
								oView.byId("EANTable").getModel("ECOMBPOST").refresh();
								oController.highlightRedTable();
							}
						}, function(error) {
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						});
					}
				}
			});
		},

		PressDefect: function() {
			if (this.getView().byId("defectContainer").getVisible() === true) {
				this.getView().byId("defectContainer").setVisible(false);
			} else {
				this.getView().byId("defectContainer").setVisible(true);
			}
		},

		/*PressEndBox: function() {
			var oController = this;
			var oView = this.getView();
			var msg = "Are you sure you want to end the TO " + oController.Hunr + "?";
			//var oView = this.getView();
			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/OperationSet(Action='1',Tanum='" + oView.byId("tonr").getValue().substr(4, 4) + "',Exidv='" + oController.Hunr +
							"')";
						oData.read(query, null, null, true, function(response) {
							if (response.Message === "OK") {
								oController.backToBox();
								oView.byId("EANTable").getModel("ECOMBPOST").refresh();
								oController.highlightRedTable();
							}
						}, function(error) {
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						});
					}
				}
			});
		},*/

		PressRePrint: function() {
			var oController = this;
			var oView = this.getView();
			var config = oController.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
			var oData = new oDataModel(sServiceUrl, true);
			var query = "/OperationSet(Action='4',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Hunr +
				"')";
			oData.read(query, null, null, true, function(response) {
				if (response.Message !== "OK") {
					MessageBox.error(response.Message, {
						title: "Information",
						onClose: function() {
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("scanEAN").focus();
							});
						}
					});
				} else {
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("scanEAN").focus();
					});
				}
			}, function(error) {
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		backToBox: function() {
			var oView = this.getView();
			oView.byId("selectingBox").setEnabled(true);
			oView.byId("selectingBox").setValue("");
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("selectingBox").focus("");
			});
			oView.byId("boxId").setText("");
			oView.byId("scanEAN").setEnabled(false);
			oView.byId("scanEAN").setValue("");
			oView.byId("fButton1").setVisible(false);
			oView.byId("fButton2").setVisible(false);
			oView.byId("fButton3").setVisible(false);
		},

		onPersoButtonPressed: function(evt) {
			this._oTPC.openDialog();
		},

		checkAllPicked: function() {
			var allpicked = false;
			this.getView().byId("EANTable").getItems().forEach(function(row) {
				var obj = row.getBindingContext("ECOMBPOST").getObject();
				if (obj.Exidv === "") {
					allpicked = true;
				}
			});
			if (allpicked === false) {
				this.getView().byId("F2").setVisible(false);
			} else {
				this.getView().byId("F2").setVisible(true);
			}
		}

	});
});