sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("ehsm.controller.Risks", {

        onInit: function () {
            // Check if user is logged in
            var sEmployeeId = sessionStorage.getItem("employeeId");
            if (!sEmployeeId) {
                this.getOwnerComponent().getRouter().navTo("Login");
                return;
            }

            // Initialize view model
            var oViewModel = new JSONModel({
                riskCount: 0,
                risks: []
            });
            this.getView().setModel(oViewModel, "view");
            this.getView().setModel(oViewModel); // Set as default model for easier binding

            // Load risks
            this._loadRisks();
        },

        _loadRisks: function () {
            var oView = this.getView();
            var oViewModel = oView.getModel("view");
            var oModel = this.getOwnerComponent().getModel();

            oView.setBusy(true);

            // Fetch data manually to allow fallback
            oModel.read("/ZNK_RISKSet", {
                urlParameters: {
                    "$format": "json"
                },
                success: function (oData) {
                    oView.setBusy(false);
                    var aRisks = oData.results || [];



                    oViewModel.setProperty("/risks", aRisks);
                    oViewModel.setProperty("/riskCount", aRisks.length);
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    console.error("Failed to load risks:", oError);
                    oViewModel.setProperty("/risks", []);
                    oViewModel.setProperty("/riskCount", 0);
                }.bind(this)
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("risksTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = [];

            if (sQuery) {
                var aSearchFilters = [
                    new Filter("RiskId", FilterOperator.Contains, sQuery),
                    new Filter("RiskDescription", FilterOperator.Contains, sQuery),
                    new Filter("RiskCategory", FilterOperator.Contains, sQuery),
                    new Filter("RiskSeverity", FilterOperator.Contains, sQuery),
                    new Filter("MitigationMeasures", FilterOperator.Contains, sQuery)
                ];
                aFilters.push(new Filter({
                    filters: aSearchFilters,
                    and: false
                }));
            }

            oBinding.filter(aFilters);
        },

        onRefresh: function () {
            this._loadRisks();
            MessageToast.show("Risks refreshed");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        onNavToDashboard: function () {
            this.getOwnerComponent().getRouter().navTo("Dashboard");
        },

        formatSeverityState: function (sSeverity) {
            switch (sSeverity) {
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

        formatLikelihoodState: function (sLikelihood) {
            switch (sLikelihood) {
                case "Likely":
                    return "Error";
                case "Unlikely":
                    return "Warning";
                case "Rare":
                    return "Success";
                default:
                    return "None";
            }
        }
    });
});
