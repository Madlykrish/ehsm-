sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ehsm.controller.Dashboard", {

        onInit: function () {
            // Check if user is logged in
            var sEmployeeId = sessionStorage.getItem("employeeId");
            if (!sEmployeeId) {
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            // Initialize view model
            var oViewModel = new JSONModel({
                employeeId: sEmployeeId,
                totalIncidents: 0,
                openIncidents: 0,
                inProgressIncidents: 0,
                closedIncidents: 0,
                totalRisks: 0,
                highRisks: 0,
                mediumRisks: 0,
                lowRisks: 0
            });
            this.getView().setModel(oViewModel, "view");

            // Load dashboard data
            this._loadDashboardData();
        },

        _loadDashboardData: function () {
            var sEmployeeId = sessionStorage.getItem("employeeId");
            // alert("DEBUG: Dashboard loaded for ID: " + sEmployeeId);
            console.log("Loading dashboard data for EmployeeId:", sEmployeeId);

            var oModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");

            // Load incidents - FETCH ALL (No Filter)
            oModel.read("/ZNK_INCIDENTSet", {
                urlParameters: {
                    "$format": "json"
                },
                success: function (oData) {
                    var aIncidents = oData.results || [];
                    console.log("Incidents loaded (" + aIncidents.length + "):", JSON.stringify(aIncidents));

                    var iOpen = 0, iInProgress = 0, iClosed = 0;

                    aIncidents.forEach(function (oIncident) {
                        if (oIncident.IncidentStatus === "Open") {
                            iOpen++;
                        } else if (oIncident.IncidentStatus === "In Progress") {
                            iInProgress++;
                        } else if (oIncident.IncidentStatus === "Closed") {
                            iClosed++;
                        }
                    });

                    oViewModel.setProperty("/totalIncidents", aIncidents.length);
                    oViewModel.setProperty("/openIncidents", iOpen);
                    oViewModel.setProperty("/inProgressIncidents", iInProgress);
                    oViewModel.setProperty("/closedIncidents", iClosed);
                }.bind(this),
                error: function (oError) {
                    console.error("Failed to load incidents:", oError);
                    // Use sample data on error too
                    oViewModel.setProperty("/totalIncidents", 5);
                    oViewModel.setProperty("/openIncidents", 3);
                    oViewModel.setProperty("/inProgressIncidents", 1);
                    oViewModel.setProperty("/closedIncidents", 1);
                }
            });

            // Load risks - FETCH ALL (No Filter)
            oModel.read("/ZNK_RISKSet", {
                urlParameters: {
                    "$format": "json"
                },
                success: function (oData) {
                    var aRisks = oData.results || [];

                    var iHigh = 0, iMedium = 0, iLow = 0;

                    aRisks.forEach(function (oRisk) {
                        if (oRisk.RiskSeverity === "High") {
                            iHigh++;
                        } else if (oRisk.RiskSeverity === "Medium") {
                            iMedium++;
                        } else if (oRisk.RiskSeverity === "Low") {
                            iLow++;
                        }
                    });

                    oViewModel.setProperty("/totalRisks", aRisks.length);
                    oViewModel.setProperty("/highRisks", iHigh);
                    oViewModel.setProperty("/mediumRisks", iMedium);
                    oViewModel.setProperty("/lowRisks", iLow);
                }.bind(this),
                error: function (oError) {
                    console.error("Failed to load risks:", oError);
                    // Use sample data on error too
                    oViewModel.setProperty("/totalRisks", 4);
                    oViewModel.setProperty("/highRisks", 2);
                    oViewModel.setProperty("/mediumRisks", 1);
                    oViewModel.setProperty("/lowRisks", 1);
                }
            });
        },

        onNavigateToIncidents: function () {
            this.getOwnerComponent().getRouter().navTo("Incidents");
        },

        onNavigateToRisks: function () {
            this.getOwnerComponent().getRouter().navTo("Risks");
        },

        onLogout: function () {
            sessionStorage.removeItem("employeeId");
            MessageToast.show("Logged out successfully");
            this.getOwnerComponent().getRouter().navTo("Login");
        }
    });
});
