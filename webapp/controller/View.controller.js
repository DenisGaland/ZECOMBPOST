sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/TablePersoController",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/ui/model/odata/ODataModel",
	"sap/m/ColumnListItem",
	"sap/m/MessageStrip",
	"sap/ui/core/BusyIndicator"
], function(Controller, TablePersoController, MessageBox, Text, oDataModel, ColumnListItem, MessageStrip, BusyIndicator) {
	"use strict";
	return Controller.extend("ZECOMBPOST.controller.View", {
		Exidv: "",
		DangerUsed: false,
		firstscan: false,
		//exidv: "false",
		onInit: function() {
			var oView = this.getView();
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("tonr").focus();
			});
		},

		toNRSearch: function(evt) {
			var oController = this;
			var oView = this.getView();
			var tonr = evt.getSource().getValue();
			var query = "";
			if (tonr.length > 8) {
				tonr = tonr.substring(0, tonr.length - 4);
				tonr = tonr.trim();
				oView.byId("tonr").setValue(parseInt(tonr, 10));
			}
			var config = this.getOwnerComponent().getManifest();
			var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
			var oData = new oDataModel(sServiceUrl, true);
			if (oView.byId("printSwitch").getState() === false) {
				query = "/CheckToSet('" + tonr + "')";
				BusyIndicator.show();
				oData.read(query, null, null, true, function(response) {
					if (response.Type === "E") {
						oView.byId("tonr").setValue("");
						BusyIndicator.hide();
						MessageBox.error(response.Message, {
							title: "Error"
						});
					} else {
						oView.byId("printSwitch").setEnabled(false);
						oView.byId("tonr").setEnabled(false);
						if (response.Danger !== "") {
							var path = $.sap.getModulePath("ZECOMBPOST", "/image");
							oView.byId("dangerimage").setSrc(path + "/danger.png");
							//oView.byId("danger").setVisible(true);
						}
						if (response.Exidv !== "") {
							MessageBox.information(response.Message, {
								title: "Information",
								onClose: function() {
									jQuery.sap.delayedCall(500, this, function() {
										oView.byId("scanEAN").focus();
										oController.highlightRedTable();
										//oController.checkAllPicked();
									});
									oController.Exidv = response.Zinhalt;
									oView.byId("selectingBox").setValue(response.ZMatnr);
									oView.byId("boxId").setValue(response.Zinhalt);
									oView.byId("scanEAN").setEnabled(true);
									oView.byId("fButton1").setVisible(true);
									oView.byId("fButton2").setVisible(true);
									oView.byId("fButton3").setVisible(true);
									oView.byId("F9").setVisible(true);
									oView.byId("scanEAN").setVisible(true);
								}
							});
						} else {
							oView.byId("fButton1").setVisible(true);
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
						oController.refreshTable();
						BusyIndicator.hide();
						/*var oTemplate = new ColumnListItem({
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
						oController.highlightRedTable();*/
					}
				}, function(error) {
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				});
			} else {
				query = "/ReprintSet('" + tonr + "')";
				oView.byId("tonr").setValue("");
				BusyIndicator.show();
				oData.read(query, null, null, true, function(response) {
					BusyIndicator.hide();
					if (response.Message !== 'OK') {
						var msg = "TO " + oView.byId("tonr").getValue() + " not yet confirmed";
						MessageBox.error(msg, {
							title: "Error",
							onClose: function() {
								jQuery.sap.delayedCall(500, this, function() {
									oView.byId("tonr").focus();
								});
							}
						});
					}
				}, function(error) {
					BusyIndicator.hide();
					MessageBox.error(JSON.parse(error.response.body).error.message.value, {
						title: "Error"
					});
				});
			}
		},

		refreshTable: function() {
			var oController = this;
			var oView = this.getView();
			var oTemplate = new ColumnListItem({
				cells: [
					new Text({
						text: "{ECOMBPOST>Gtin}"
					}),
					new Text({
						text: "{ECOMBPOST>Maktx}"
					}),
					new Text({
						text: "{=parseInt(${ECOMBPOST>Tanum})}"
							//text: "{ECOMBPOST>Tanum}"
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
						text: "{ECOMBPOST>ZQtyOverpick}"
					}),
					/*new Text({
						text: "{ECOMBPOST>Exidv}"
					}),*/
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
						text: "{=${ECOMBPOST>Vlber}.charAt(0)}"
							//text: "{ECOMBPOST>Tanum}"
					})
				]
			});
			oView.byId("EANTable").bindItems({
				path: "ECOMBPOST>/CheckToSet('" + oView.byId("tonr").getValue() + "')/TOtoItemsNav",
				template: oTemplate
			});
			oController.highlightRedTable();
		},

		highlightRedTable: function(evt) {
			var oTable = this.getView().byId("EANTable");
			oTable.attachUpdateFinished(function() {
				this.getItems().forEach(function(row) {
					var obj = row.getBindingContext("ECOMBPOST").getObject();
					if (obj.Tapos >= "9000") {
						row.$().addClass("grey");
					} else if (obj.ZQtyOriginal === obj.ZQtyPack) {
						row.$().addClass("green");
					} else if (obj.ZQtyPack < obj.ZQtyOriginal && obj.ZQtyPack > "0") {
						row.$().addClass("orange");
					} else if (obj.ZQtyPicking === "0" && obj.Stat === "10") {
						row.$().addClass("red");
					} else if (obj.ZQtyPicking === "0" && obj.Stat === "11") {
						row.$().addClass("yellow");
					}
				});
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
			BusyIndicator.show();
			oData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.Message === "OK") {
					oController.Exidv = response.Exidv;
					oView.byId("boxId").setValue(response.Hunr);
					oView.byId("selectingBox").setEnabled(false);
					oView.byId("selectingBox").setValue(response.ZMatnr);
					oView.byId("scanEAN").setEnabled(true);
					jQuery.sap.delayedCall(500, this, function() {
						oView.byId("scanEAN").focus();
					});
					oView.byId("fButton1").setVisible(true);
					oView.byId("fButton2").setVisible(true);
					oView.byId("fButton3").setVisible(true);
					oView.byId("F9").setVisible(true);
					oView.byId("scanEAN").setVisible(true);
					//oView.byId("EANTable").getModel("ECOMBPOST").refresh();
					oController.refreshTable();
					oController.highlightRedTable();
				} else {
					MessageBox.error(response.Message, {
						title: "Error",
						onClose: function() {
							oView.byId("selectingBox").setValue("");
							jQuery.sap.delayedCall(500, this, function() {
								oView.byId("selectingBox").focus();
							});
						}
					});
				}
			}, function(error) {
				BusyIndicator.hide();
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
				"',Exidv='" + this.Exidv +
				"',Hunr='" + oView.byId("boxId").getValue() +
				"',Defect='" + defect +
				"')";
			evt.getSource().setValue("");
			BusyIndicator.show();
			oData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
				if (response.Message !== 'OK') {
					if (response.Message.indexOf("DANGEROUS") !== -1) {
						if (oController.DangerUsed === false) {
							oController.DangerUsed = true;
							MessageBox.information(response.Message);
						}
					} else {
						MessageBox.information(response.Message);
					}
				}
				oController.firstscan = true;
				oController.refreshTable();
				oController.highlightRedTable();
			}, function(error) {
				BusyIndicator.hide();
				MessageBox.error(JSON.parse(error.response.body).error.message.value, {
					title: "Error"
				});
			});
		},

		/*PressNewbox: function(evt) {
			this.backToBox();
			this.checkAllPicked();
		},*/

		PressEndTo: function() {
			var oController = this;
			var oView = this.getView();
			var allpacked = true;
			var msg = '';
			oView.byId("EANTable").getItems().forEach(function(row) {
				var obj = row.getBindingContext("ECOMBPOST").getObject();
				if (obj.ZQtyOriginal !== obj.ZQtyPack) {
					allpacked = false;
				}
			});
			if (allpacked === true) {
				msg = "Confirm TO " + oView.byId("tonr").getValue() + "?";
			} else {
				msg = "Are you sure you want to confirm the TO " + oView.byId("tonr").getValue() + "?";
			}

			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/OperationSet(Action='9',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Exidv + "',Hunr='" +
							oView.byId("boxId").getValue() + "',Totweight='" + oView.byId("Totweight").getValue() + "')";
						BusyIndicator.show();
						oData.read(query, null, null, true, function(response) {
							BusyIndicator.hide();
							if (response.Message === "OK") {
								MessageBox.error("TO Finalized", {
									title: "Information",
									onClose: function() {
										oController.backToToNr();
										oController.refreshTable();
										oController.highlightRedTable();
									}
								});
							} else {
								MessageBox.error(response.Message, {
									title: "Error",
									onClose: function() {
										jQuery.sap.delayedCall(500, this, function() {
											oView.byId("scanEAN").focus();
										});
									}
								});
							}
						}, function(error) {
							BusyIndicator.hide();
							MessageBox.error(JSON.parse(error.response.body).error.message.value, {
								title: "Error"
							});
						});
					}
				}
			});
		},

		backToToNr: function() {
			var oView = this.getView();
			oView.byId("tonr").setValue("");
			oView.byId("tonr").setEnabled(true);
			oView.byId("selectingBox").setValue("");
			oView.byId("boxId").setValue("");
			oView.byId("scanEAN").setEnabled(false);
			oView.byId("fButton1").setVisible(false);
			oView.byId("fButton2").setVisible(false);
			oView.byId("fButton3").setVisible(false);
			oView.byId("F9").setVisible(false);
			oView.byId("scanEAN").setVisible(false);
			oView.byId("dangerimage").setSrc("");
			oView.byId("printSwitch").setEnabled(true);
			oView.byId("printSwitch").setState(false);
			this.firstscan = false;
			this.DangerUsed = false;
			//oView.byId("appid").getModel("ECOMBPOST").updateBindings();
			oView.byId("appid").bindElement({
				path: "/CheckToSet('0')",
				model: "ECOMBPOST",
				parameters: {
					expand: "TOtoItemsNav"
				}
			});
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("tonr").focus();
			});
			/*oView.byId("Benum").setValue("");
			oView.byId("Nrreferences").setValue("");
			oView.byId("Refpicked").setValue("");
			oView.byId("Totweight").setValue("");
			oView.byId("Totqty").setValue("");
			oView.byId("Qtypicked").setValue("");
			oView.byId("Volum").setValue("");
			oView.byId("Totalto").setValue("");
			oView.byId("Tomanaged").setValue("");
			oView.byId("Proposedbox").setValue("");
			oView.byId("Proposedweight").setValue("");
			oView.byId("Proposedvolume").setValue("");
			oView.byId("Custname").setValue("");
			oView.byId("Shipaddress").setValue("");
			oView.byId("Custaddress").setValue("");
			oView.byId("Inco2").setValue("");
			oView.byId("selectingBox").setValue("");
			oView.byId("boxId").setValue("");
			oView.byId("tonr").setEnabled(true);
			oView.byId("tonr").setValue("");
			oView.byId("scanEAN").setValue("");
			oView.byId("fButton1").setVisible(false);
			oView.byId("fButton2").setVisible(false);
			oView.byId("fButton3").setVisible(false);
			jQuery.sap.delayedCall(500, this, function() {
				oView.byId("tonr").focus();
			});*/
		},

		PressCancelTO: function(evt) {
			var oController = this;
			var oView = this.getView();
			var msg = "Are you sure you want to delete the ongoing packing " + oController.Exidv + "?";
			//var oView = this.getView();
			MessageBox.confirm(msg, {
				//title: sTitle,
				initialFocus: MessageBox.Action.CANCEL,
				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var config = oController.getOwnerComponent().getManifest();
						var sServiceUrl = config["sap.app"].dataSources.ZECOMBPOST_SRV.uri;
						var oData = new oDataModel(sServiceUrl, true);
						var query = "/OperationSet(Action='3',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Exidv + "',Hunr='" +
							oView.byId("boxId").getValue() + "',Totweight='" + oView.byId("Totweight").getValue() + "')";
						BusyIndicator.show();
						oData.read(query, null, null, true, function(response) {
							BusyIndicator.hide();
							if (response.Message === "OK") {
								//oController.backToBox();
								oController.backToToNr();
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
								oController.refreshTable();
								oController.highlightRedTable();
							}
						}, function(error) {
							BusyIndicator.hide();
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
			var query = "/OperationSet(Action='4',Tanum='" + oView.byId("tonr").getValue() + "',Exidv='" + oController.Exidv + "',Hunr='" +
				oView.byId("boxId").getValue() + "',Totweight='" + oView.byId("Totweight").getValue() + "')";
			BusyIndicator.show();
			oData.read(query, null, null, true, function(response) {
				BusyIndicator.hide();
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
				BusyIndicator.hide();
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
				oView.byId("tonr").focus("");
			});
			oView.byId("boxId").setValue("");
			oView.byId("scanEAN").setEnabled(false);
			oView.byId("scanEAN").setValue("");
			this.firstscan = false;
			oView.byId("fButton1").setVisible(false);
			oView.byId("fButton2").setVisible(false);
			oView.byId("fButton3").setVisible(false);
			this.DangerUsed = false;
		},

		onPersoButtonPressed: function(evt) {
			this._oTPC.openDialog();
		}

		/*checkAllPicked: function() {
			var allpicked = false;
			this.getView().byId("EANTable").getItems().forEach(function(row) {
				var obj = row.getBindingContext("ECOMBPOST").getObject();
				if (obj.Exidv === "") {
					allpicked = true;
				}
			});
			if (allpicked === true && this.firstscan === true) {
				this.getView().byId("F2").setVisible(true);
			} else {
				this.getView().byId("F2").setVisible(false);
			}
		}*/
	});
});