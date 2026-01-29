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
            } else {
                sessionStorage.removeItem("employeeId");
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

            // DEBUG: Alert to verify input
            // alert("DEBUG: Logging in with ID: " + sPaddedEmployeeId);

            // Call login OData service
            var sPath = "/ZNK_loginSet(EmployeeId='" + sPaddedEmployeeId + "',Password='" + encodeURIComponent(sPassword) + "')";

            oModel.read(sPath, {
                urlParameters: {
                    "$format": "json"
                },
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

                    var sErrorMessage = "Login failed. Please check your credentials and network connection.";

                    // Try to parse error response
                    if (oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message) {
                                sErrorMessage = oErrorResponse.error.message.value || oErrorResponse.error.message;
                            }
                        } catch (e) {
                            // If JSON parsing fails, check if it's XML
                            if (oError.responseText.indexOf("<?xml") === 0) {
                                sErrorMessage = "Login failed. Please verify your credentials.";
                            }
                        }
                    }

                    console.error("Login error:", oError);
                    oMessageStrip.setText(sErrorMessage);
                    oMessageStrip.setType("Error");
                    oMessageStrip.setVisible(true);
                }.bind(this)
            });
        }
    });
});
