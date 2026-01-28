sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("ehsm.controller.Login", {

        onInit: function () {
            // Initialize view model for login form
            var oViewModel = new JSONModel({
                employeeId: "",
                password: ""
            });
            this.getView().setModel(oViewModel, "view");
            
            // Check if already logged in
            var sEmployeeId = sessionStorage.getItem("employeeId");
            if (sEmployeeId) {
                this.getOwnerComponent().getRouter().navTo("Dashboard");
            }
        },

        onLogin: function () {
            var oView = this.getView();
            var oViewModel = oView.getModel("view");
            var sEmployeeId = oViewModel.getProperty("/employeeId");
            var sPassword = oViewModel.getProperty("/password");
            var oMessageStrip = this.byId("loginMessage");

            // Validate inputs
            if (!sEmployeeId || !sPassword) {
                oMessageStrip.setText("Please enter both Employee ID and Password");
                oMessageStrip.setType("Error");
                oMessageStrip.setVisible(true);
                return;
            }

            // Show busy indicator
            oView.setBusy(true);
            oMessageStrip.setVisible(false);

            // Get OData model
            var oModel = this.getOwnerComponent().getModel();

            // Pad employee ID to 8 digits if needed
            var sPaddedEmployeeId = sEmployeeId.padStart(8, '0');

            // Call login OData service
            var sPath = "/ZNK_loginSet(EmployeeId='" + sPaddedEmployeeId + "',Password='" + sPassword + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    oView.setBusy(false);
                    
                    if (oData.Status === "Success") {
                        // Store employee ID in session
                        sessionStorage.setItem("employeeId", sPaddedEmployeeId);
                        
                        // Show success message
                        MessageToast.show("Login successful!");
                        
                        // Navigate to dashboard
                        this.getOwnerComponent().getRouter().navTo("Dashboard");
                    } else {
                        oMessageStrip.setText("Invalid credentials. Please try again.");
                        oMessageStrip.setType("Error");
                        oMessageStrip.setVisible(true);
                    }
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    
                    var sErrorMessage = "Login failed. Please check your credentials.";
                    try {
                        var oErrorResponse = JSON.parse(oError.responseText);
                        if (oErrorResponse.error && oErrorResponse.error.message) {
                            sErrorMessage = oErrorResponse.error.message.value;
                        }
                    } catch (e) {
                        // Use default error message
                    }
                    
                    oMessageStrip.setText(sErrorMessage);
                    oMessageStrip.setType("Error");
                    oMessageStrip.setVisible(true);
                }.bind(this)
            });
        }
    });
});
