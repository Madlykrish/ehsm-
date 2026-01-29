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

            // Create filter for current employee
            var aFilters = [
                new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)
            ];

            // Load incidents - WITH FILTER
            oModel.read("/ZNK_INCIDENTSet", {
                filters: aFilters,
                urlParameters: {
                    "$format": "json"
                },
                success: function (oData) {
                    var aIncidents = oData.results || [];
                    console.log("Incidents loaded (" + aIncidents.length + "):", JSON.stringify(aIncidents));

                    // Notify user EXACTLY what backend returned
                    if (aIncidents.length === 0) {
                        MessageToast.show("Backend returned 0 Incidents. Check SAP System.");
                    } else {
                        MessageToast.show("Loaded " + aIncidents.length + " Incidents from Backend.");
                    }

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
                    oViewModel.setProperty("/totalIncidents", 0);
                    oViewModel.setProperty("/openIncidents", 0);
                    oViewModel.setProperty("/inProgressIncidents", 0);
                    oViewModel.setProperty("/closedIncidents", 0);
                }
            });

            // Load risks - WITH FILTER
            oModel.read("/ZNK_RISKSet", {
                filters: aFilters,
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
                    oViewModel.setProperty("/totalRisks", 0);
                    oViewModel.setProperty("/highRisks", 0);
                    oViewModel.setProperty("/mediumRisks", 0);
                    oViewModel.setProperty("/lowRisks", 0);
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
