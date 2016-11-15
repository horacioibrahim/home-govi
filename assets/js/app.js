// Initialize Firebase

/** `Govi` constructor function */
function Govi() {
    var self = this; // global reference into Govi scope.
    var _user;
    this.helpers = {
        fire: function(eventName, value) {
             var event = new CustomEvent(eventName, {'detail': value});
             document.dispatchEvent(event);
        }
    }
    this.config = {
        development: {
            apiKey: "AIzaSyDTwea9SlzpSopXe4KxKP21qVVPF86qckc",
            authDomain: "govi-project.firebaseapp.com",
            databaseURL: "https://govi-project.firebaseio.com",
            storageBucket: "govi-project.appspot.com",
            messagingSenderId: "807503482619"          
        },
        production: {
            apiKey: "AIzaSyDTwea9SlzpSopXe4KxKP21qVVPF86qckc",
            authDomain: "govi-project.firebaseapp.com",
            databaseURL: "https://govi-project.firebaseio.com",
            storageBucket: "govi-project.appspot.com",
            messagingSenderId: "807503482619"           
        }
    };
    this.environment = (function(){
        if (navigator.onLine !== false) {
            try {
                if (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1"){
                    firebase.initializeApp(self.config.development);
                    console.log("development");
                    return "development";
                } else {
                    firebase.initializeApp(self.config.production);
                    console.log("production");
                    return "production";
                }
            }
            catch (err) {
                console.log("firebase not downloaded");
            }
        }
        return null;
    })();
    this.db = (function() {
        if (self.environment) {
            return firebase.database();    
        }
    })();
    this.auth = (function(){
        if (self.environment) {
            return firebase.auth();
        }
    })();
    this.displayname = function(user) {
                var displayName = '';
                var dname = user.displayName;
                var words = dname.split(' ');
                
                for (var i = 0; i < words.length; i++) {
                    var w = words[i];
                    if (w.length > 2) {
                        w = w.substr(0,1).toUpperCase() + w.substr(1).toLowerCase()
                        displayName += w + ' ';
                    }
                }
                return displayName.trim();
    };
    this._getUserFirebaseOrLocal = (function(){
        var user = null;
        
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var verified = user.emailVerified;
            var email = user.email;
            if (verified) {
                window.localStorage.setItem('user', JSON.stringify(user));
                // window.location.href = "#/dashboard";
            } else {
                // wrapper to handling error if email not verified.
                var error = {
                    code: 111,
                    msg: "Email não verificado.",
                    email: email
                };
                // if error redirect to page
                window.localStorage.setItem('lastError', JSON.stringify(error));
                //window.location.href = "#/oops";
                console.log('email not verified');
                console.log("TODO: redirect to resend confirmation");
            }
          } else {
            // No user is signed in.
            // has session
            //var user = window.localStorage.getItem('user');
            //if (!user || user == "undefined" || user == "null") {
                //window.location.href = "#/login";
            //    console.log("TODO: redirect to login page");
            //} else {
            //    user = JSON.parse(user);
            //}              
          }
            if (user) {
                user.mockDisplayName = self.displayname(user);    
            }
            self._user = user;
            self.helpers.fire('user-updated', user);
            return self._user;            
        });
    })();
    this.logout = function() {
        window.localStorage.setItem('user', null);
        self.auth.signOut();
    };
    // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Trabalhando_com_Objetos
    Object.defineProperties(self, {
       //"user": {get: function(){return self._getUserFirebaseOrLocal}, set: function(v){self._user = v}}
       "user": {get: function(){return self._user}, set: function(){
           // reset user info
           self._getUserFirebaseOrLocal();
       }} 
    });
}

/**** Helpers *********/
Govi.prototype = {
    /** `getParameterByName` simple way get simple params in the querystring.
    * This code is copied from:
    * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    *
    * @param {string} name this is variable name in querystring
    * @param {string} url is current URL in bro
    */    
    getParameterByName: function (name, url) {
        url = !url ? window.location.href : url;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    /** `getSubroute` take the subroute info from current 
    * URL.
    *
    * @param {string} hash from window.location.hash
    * @returns {string} with subroute id.
    */
    getSubroute: function (hash) {
        var hash = !hash ? window.location.hash : hash;
        var routes = hash.split('/');
        var subroute;
        if (routes.length > 2) {
            subroute = routes[2];
        } else {
            console.log("Not exists subroute");
            return ;
        }
        return subroute;
    }, 
    /** `getTitle` parse first line to find h.title 
    *
    * @param {string} text will be parsed.
    * @returns {string} with title.
    */    
    getTitle: function(text) {
        var rex = /^<h[\d]>(.*)<\/h[\d]>/;
        var groups = rex.exec(text);
        //console.log(groups);
        if (groups) {
            group = groups[groups.length -1];    
        } else {
            console.warn("O author do post precisar colocar um título na primeira linha. É obrigatório...hehehe!");
            return null;
        }
        
        // remove all tags
        return group.replace(/(<([^>]+)>)/ig,"");
    },
    getIntro: function(text) {
        var hiddenText = this.getTitle(text);
        var introText = hiddenText ? text.replace(hiddenText, '') : "";
        if (introText) {
            introText = introText.replace(/(<([^>]+)>)/ig, "");
            introText = introText.substring(0, 140);
            return introText + '...';            
        }
        //text.replace()
    }, 
    /* Date handlers */
    getDateFromTimestamp: function(timestamFromNow) {
        var monthsArr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        // Inpired by http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
        var date = new Date(timestamFromNow);
        // Day
        var day = "0" + date.getDate();
        // year
        var year = date.getFullYear();
        // Month
        var month = "0" + parseInt(date.getMonth() + 1);
        // Hours part from the timestamp
        var hours = "0" + date.getHours();
        // Minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
        // Seconds part from the timestamp
        var seconds = "0" + date.getSeconds()
        //
        // Will display time in 10:30:23 format
        //var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        formattedDate = year + '-' + month.substr(-2) + '-' + day.substr(-2) + ' ' + hours.substr(-2) + ':' + minutes.substr(-2);
        // var formattedDate = day.substr(-2) + " " + monthsArr[month-1];
        return formattedDate;
    }   
}


var app = new Govi();
