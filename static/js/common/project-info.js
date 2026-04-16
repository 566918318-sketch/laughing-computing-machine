$(document).ready(function () {
    var license = "MIT License";
    var source = "Adapted from an open-source quiz project";
    var disclaimer = "This customized build is intended for learning, writing, and demo use only.";
    console.group("Project Information");

    console.log("%cThis project is licensed under the " + license, "color: darkorange; font-size: 20px;");
    console.log("%c" + source, "color: darkorange; font-size: 20px;");
    console.log("%cDisclaimer: " + disclaimer, "color: darkorange; font-size: 20px;");

    console.groupEnd();
});
