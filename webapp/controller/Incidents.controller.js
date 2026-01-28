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
                incidentCount: 0
            });
            this.getView().setModel(oViewModel, "view");

            // Load incidents
            this._loadIncidents();
        },

        _loadIncidents: function () {
            var sEmployeeId = sessionStorage.getItem("employeeId");
            var oTable = this.byId("incidentsTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                // Apply filter for employee ID
                var aFilters = [
                    new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)
                ];
                oBinding.filter(aFilters);

                // Update count
                var that = this;
                oBinding.attachDataReceived(function (oEvent) {
                    var iCount = oEvent.getParameter("data") ? oEvent.getParameter("data").results.length : 0;
                    that.getView().getModel("view").setProperty("/incidentCount", iCount);
                });
            }
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oTable = this.byId("incidentsTable");
            var oBinding = oTable.getBinding("items");
            var sEmployeeId = sessionStorage.getItem("employeeId");

            var aFilters = [
                new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)
            ];

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
