sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("ehsm.controller.Incidents", {

        onInit: function () {
            // Check if user is logged in
            var sEmployeeId = sessionStorage.getItem("employeeId");
            if (!sEmployeeId) {
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            // Initialize view model
            var oViewModel = new JSONModel({
                incidentCount: 0,
                incidents: []
            });
            this.getView().setModel(oViewModel, "view");
            this.getView().setModel(oViewModel); // Set as default model for easier binding

            // Load incidents
            this._loadIncidents();
        },

        _loadIncidents: function () {
            var oView = this.getView();
            var oViewModel = oView.getModel("view");
            var oModel = this.getOwnerComponent().getModel();

            oView.setBusy(true);

            // Fetch data manually to allow fallback
            oModel.read("/ZNK_INCIDENTSet", {
                urlParameters: {
                    "$format": "json"
                },
                success: function (oData) {
                    oView.setBusy(false);
                    var aIncidents = oData.results || [];

                    if (aIncidents.length === 0) {
                        MessageToast.show("Backend returned 0 Incidents.");
                    } else {
                        MessageToast.show("Loaded " + aIncidents.length + " Incidents.");
                    }

                    oViewModel.setProperty("/incidents", aIncidents);
                    oViewModel.setProperty("/incidentCount", aIncidents.length);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    console.error("Failed to load incidents:", oError);
                    oViewModel.setProperty("/incidents", []);
                    oViewModel.setProperty("/incidentCount", 0);
                }.bind(this)
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("incidentsTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = [];

            if (sQuery) {
                var aSearchFilters = [
                    new Filter("IncidentId", FilterOperator.Contains, sQuery),
                    new Filter("IncidentDescription", FilterOperator.Contains, sQuery),
                    new Filter("IncidentCategory", FilterOperator.Contains, sQuery),
                    new Filter("IncidentStatus", FilterOperator.Contains, sQuery)
                ];
                aFilters.push(new Filter({
                    filters: aSearchFilters,
                    and: false
                }));
            }

            oBinding.filter(aFilters);
        },

        onRefresh: function () {
            this._loadIncidents();
            MessageToast.show("Incidents refreshed");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        onNavToDashboard: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "High":
                    return "Error";
                case "Medium":
                    return "Warning";
                case "Low":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "Open":
                    return "Error";
                case "In Progress":
                    return "Warning";
                case "Closed":
                    return "Success";
                default:
                    return "None";
            }
        }
    });
});
