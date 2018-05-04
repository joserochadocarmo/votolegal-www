

// base uri
var BASE_API = '';

var BASE_API_JS = '';


var server = window.location;
if (server.hostname == 'dev-participe.votolegal.com.br' || server.hostname == 'localhost') {
	BASE_API_JS = '//dapi.votolegal.com.br/api';
} else {
	BASE_API_JS = '//dapi.votolegal.com.br/api';
}


//= require vendors
//= require_self
//= require_tree ./app/controller/






app = window.app || {};
//(function(app){
/**
 * GLOBALS
 */
// underscore
_.templateSettings = {
	interpolate: /\{\{\=(.+?)\}\}/g,
	evaluate: /\{\{(.+?)\}\}/g
};

var __bind = function (fn, me) {
	return function () {
		return fn.apply(me, arguments);
	};
};

/**
 * Array polyfills
 */
if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		var T, A, k;
		if (this == null) throw new TypeError(' this is null or not defined');
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
		if (arguments.length > 1) T = thisArg;
		A = new Array(len);
		k = 0;
		while (k < len) {
			var kValue, mappedValue;
			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue, k, O);
				A[k] = mappedValue;
			}
			k++;
		}
		return A;
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun) {
		'use strict';

		if (this === void 0 || this === null) throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== 'function') throw new TypeError();

		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i];
				if (fun.call(thisArg, val, i, t)) res.push(val);
			}
		}
		return res;
	};
}
// loops
NodeList.prototype.forEach = Array.prototype.forEach;


/**
 * Brazilian currency class
 */
window.BrazilianCurrency = (function () {
	function BrazilianCurrency(amount) {
		this.amount = amount;
	}

	BrazilianCurrency.prototype.format = function (opts) {
		var amount, cents, formated, i, reals, salts, _i, _len, _ref;
		if (opts == null) {
			opts = {};
		}
		amount = (this.amount / 100).toFixed(2);
		reals = amount.split(/\./)[0];
		cents = amount.split(/\./)[1];
		formated = [];
		salts = 0;
		_ref = reals.split('').reverse();
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			i = _ref[_i];
			formated.push(i);
			if (salts === 2) {
				if (i !== (reals.length + 1)) {
					formated.push(".");
				}
				salts = 0;
				continue;
			}
			salts++;
		}
		formated = formated.reverse();
		if (formated[0] === '.') {
			formated.shift();
		}
		formated = "" + (formated.join('')) + "," + cents;
		if (opts && opts.simbol === true) {
			return "R$ " + formated;
		}
		return "" + formated;
	};

	return BrazilianCurrency;

})();


/**
 * CreditCard Brand verification
 */
var CreditCard = (function () {
	CreditCard.prototype.brands = [{
		name: 'Elo',
		pattern: '^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|(506699|5067[0-6]\d|50677[0-8])|(50900\d|5090[1-9]\d|509[1-9]\d{2})|65003[1-3]|(65003[5-9]|65004\d|65005[0-1])|(65040[5-9]|6504[1-3]\d)|(65048[5-9]|65049\d|6505[0-2]\d|65053[0-8])|(65054[1-9]|6505[5-8]\d|65059[0-8])|(65070\d|65071[0-8])|65072[0-7]|(65090[1-9]|65091\d|650920)|(65165[2-9]|6516[6-7]\d)|(65500\d|65501\d)|(65502[1-9]|6550[3-4]\d|65505[0-8]))[0-9]{10,12}',
		alias: 'elo'
	}, {
		name: 'Diners',
		pattern: '^3(?:0[0-5]|[68][0-9])[0-9]{11}$',
		alias: 'diners'
	}, {
		name: 'Discover',
		pattern: '^6(?:011|5[0-9]{2})[0-9]{12}$',
		alias: 'discover'
	}, {
		name: 'Hipercard',
		pattern: '^(38[0-9]{17}|60[0-9]{14})$',
		alias: 'hipercard'
	}, {
		name: 'Amex',
		pattern: '^3[47][0-9]{13}$',
		alias: 'americanexpress'
	}, {
		name: 'Aura',
		pattern: '^50[0-9]{14,17}$',
		alias: 'aura'
	}, {
		name: 'Mastercard',
		pattern: '^(5[1-5][0-9]{14}|2221[0-9]{12}|222[2-9][0-9]{12}|22[3-9][0-9]{13}|2[3-6][0-9]{14}|27[01][0-9]{13}|2720[0-9]{12})$',
		alias: 'mastercard'
	}, {
		name: 'Visa',
		pattern: '^4[0-9]{12}(?:[0-9]{3})?$',
		alias: 'visa'
	}, {
		name: 'JCB',
		pattern: '^35(2[89]|[3-8][0-9])',
		alias: 'jbc'
	}];

	function CreditCard(options) {
		if (options == null) {
			options = {};
		}
		this.card_brand = __bind(this.card_brand, this);
		this.options = options || {};
	}

	CreditCard.prototype.card_brand = function (number) {
		var card_type, _i, _len, _ref;
		_ref = this.brands;
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			card_type = _ref[_i];
			if (number.match(card_type.pattern)) {
				return card_type;
			}
		}
		return null;
	};

	return CreditCard;

})();


/**
 * URI class
 */
var URI = (function () {
	return {
		// attributes
		_location: undefined,

		// methods
		init: function (location) {
			this._location = location;
			return this;
		},
		absolute: function () {
			return this._location || document.location.href;
		},
		query: function (name) {
			var url = this.absolute();
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		}
	}
})();
// Ex.: URI.init('https://google.com?q=js').query('q');


/**
 * Params class
 */
var Params = (function () {
	return {
		_value: undefined,
		require: function (value) {
			if (value == null || value == undefined)
				throw new Error('value cannot be undefined');

			this._value = value;

			return this;
		},
		permit: function () {
			var _self = this;

			var param_list = {};
			for (var i in arguments) {
				param_list[arguments[i]] = _self._value[arguments[i]] || "";
			}

			return param_list;
		},
		normalize: function (value) {
			return name.split(/\s+/)
				.map(function (i) {
					i = i.toLowerCase();
					if (i.length >= 3) return i.charAt(0).toUpperCase() + i.slice(1);
					if (i.length < 3) return i;
				});
		}
	}
})();
// Ex.: Params.require({cname:'...', user:'...', name:'...', password:'...'}).permit('user', 'name', 'password')


var DocumentFormat = (function () {
	function DocumentFormat() {}

	DocumentFormat.prototype.format = function (doc) {
		var formated, g;
		formated = doc;
		switch (doc.length) {
			case 11:
				g = doc.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
				return formated = [g[1], '.', g[2], '.', g[3], '-', g[4]].join('');
			case 14:
				g = doc.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
				return formated = [g[1], '.', g[2], '.', g[3], '/', g[4], '-', g[5]].join('');
		}
	};

	return DocumentFormat;

})();


/**
 * Serializer
 */
var Serializer = function () {
	this.from_object = function (data) {
		var buffer = [];

		if (typeof data !== 'object')
			throw new Error('Param to be serializer isnt a object');

		for (var name in data) {
			if (!data.hasOwnProperty(name)) continue;

			var value = data[name];
			buffer.push(
				encodeURIComponent(name) + "=" +
				encodeURIComponent((value == null) ? "" : value)
			);
		}

		return buffer.join("&").replace(/%20/g, "+");
	};

	this.from_form = function (element_id) {
		var f = document.forms[element_id];

		var buffer = {};
		for (var i in f.elements) {
			if (f.elements[i].type !== undefined)
				buffer[f.elements[i].name] = f.elements[i].value;
		}
		return this.from_object(buffer);
	};

	this.to_json = function (data) {
		return JSON.stringify(data);
	};
};


// error messages translation
var error_msg = function (token) {
	var msg_list = {
		"missing": " não foi preenchido.",
		"invalid": " está inválido.",
		"already exists": " já foi cadastrado.",
		"access denied": "Acesso negado!",
		"Bad email or password.": "E-mail ou senha inválidos.",
		"invalid token": " é invalido ou esta expirado."
	};
	return msg_list[token];
};


/**
 * State class
 */
var State = (function () {
	return {
		_value: {
			"AC": "Acre",
			"AL": "Alagoas",
			"AP": "Amapá",
			"AM": "Amazonas",
			"BA": "Bahia",
			"CE": "Ceará",
			"DF": "Distrito Federal",
			"ES": "Espírito Santo",
			"GO": "Goiás",
			"MA": "Maranhão",
			"MT": "Mato Grosso",
			"MS": "Mato Grosso do Sul",
			"MG": "Minas Gerais",
			"PA": "Pará",
			"PB": "Paraíba",
			"PR": "Paraná",
			"PE": "Pernambuco",
			"PI": "Piauí",
			"RJ": "Rio de Janeiro",
			"RN": "Rio Grande do Norte",
			"RS": "Rio Grande do Sul",
			"RO": "Rondônia",
			"RR": "Rorâima",
			"SC": "Santa Catarina",
			"SP": "São Paulo",
			"SE": "Sergipe",
			"TO": "Tocantins"
		},
		by_uf: function (uf) {
			return this._value[uf]
		}
	};
})();


/**
 * VotoLegal Project App
 */
app.votolegal = angular.module('votolegal', ['ngRoute', 'ngMask', 'ngSanitize', 'angular-storage', 'idf.br-filters', 'oitozero.ngSweetAlert', 'ui.utils.masks', 'ui.bootstrap', 'angular-table']);
app.votolegal.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
	// http configurations
	delete $httpProvider.defaults.headers.common["X-Requested-With"];
	$httpProvider.defaults.headers.common["Content-Type"] = 'application/x-www-form-urlencoded';

	// location configurations
	$locationProvider.html5Mode(false);
}]);

/**
 * Serializer Service
 */
app.votolegal.factory('serialize', function () {
	return new Serializer()
});


/**
 * Show String as HTML
 */
app.votolegal.filter('unsafe', ['$sce', function ($sce) {
	return function (val) {
		return $sce.trustAsHtml(val)
	};
}]);

/**
 * Postmon Service
 * Connect to the Postmon service API to get zipcode informations
 */
app.votolegal.factory('postmon', ['$http', function ($http) {
	return function (zipcode) {
		return $http.get('//api-apoiadores.appcivico.com/cep?cep=' + zipcode, {
			cache: false
		});
	}
}]);

/**
 * Serializer Service
 */
app.votolegal.factory('serialize', function () {
	return new Serializer()
});


/**
 * Troublesoting Service
 * Connect to the Postmon service API to get zipcode informations
 */
app.votolegal.factory('trouble', ['$http', 'serialize', function ($http, serialize) {
	return {
		shoot: function (params) {
			if (!params.hasOwnProperty('route')) console.log('route param for troubleshoot is required');
			if (!params.hasOwnProperty('error')) console.log('error param for troubleshoot is required');

			if (params.route && params.error) {
				$http({
					method: 'POST',
					url: BASE_API_JS + '/troubleshoot',
					data: serialize.from_object(params),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});
			}
		}
	}
}]);


/**
 * Authentication Service

 */
app.votolegal.factory('auth_service', ['$http', 'serialize', 'store', function ($http, serialize, store) {
	return {
		// attributes
		session_key: 'user',
		sign_page: '/',
		admin_page: '/admin',
		role_list: {
			admin: '/admin',
			user: '/cadastro-completo'
		},

		// methods
		authenticate: function (username, password) {
			return $http({
				method: 'POST',
				url: BASE_API_JS + '/login',
				data: serialize.from_object({
					"email": username,
					"password": password
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
		},

		// forgot password
		forgot_password: function (username) {
			return $http({
				method: 'POST',
				url: BASE_API_JS + '/login/forgot_password',
				data: serialize.from_object({
					"email": username
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
		},

		// change my password
		change_password: function (password, token) {
			return $http({
				method: 'POST',
				url: BASE_API_JS + '/login/forgot_password/reset/' + token,
				data: serialize.from_object({
					"new_password": password
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
		},

		// store wrapper
		session: function () {
			return store;
		},

		// load user data
		current_user: function () {
			return this.session().get(this.session_key);
		},

		// validate user
		// usage: validate_user({role: 'admin'})
		validate_user: function () {
			var args = arguments[0] || {};

			var user = this.current_user() || undefined;

			// validate session
			if (user == undefined)
				document.location = this.sign_page;
			// validade role
			if (user.role != args.role)
				document.location = '/error/permissao-negada';

			return false;
		},

		signature_exists: function () {
			if (this.current_user) return true;
			return false;
		},

		// logout
		logout: function () {
			this.session().remove(this.session_key);
			if (arguments[0]) document.location = arguments[0];
			return false;
		}
	}
}]);


app.votolegal.factory('contract_service', ['$http', 'serialize', 'store', function ($http, serialize, store) {
	return {
		contract: function (id) {
			return $http({
				method: 'POST',
				url: BASE_API_JS + '/candidate/' + id + '/contract_signature',
			})
		}
	}
}]);

app.votolegal.factory('session_pagseguro', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {
		getSessionId: function (id) {
			return $http({
				method: 'GET',
				url: BASE_API_JS + '/candidate/' + id + '/payment/session',
			}).then(function (response) {
				return response
			})
		}
	}
}]);
app.votolegal.factory('payment_pagseguro', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {
		payment: function (id, sender_hash, credit_card_token, method, name, email, cpf, phone, address_zipcode, address_state, address_city, address_district, address_street, address_house_number) {

			return $http({
				method: 'POST',
				url: BASE_API_JS + '/candidate/' + id + '/payment',
				data: serialize.from_object({
					"sender_hash": sender_hash,
					"credit_card_token": credit_card_token,
					'method': method,
					"name": name,
					"email": email,
					"cpf": cpf,
					"address_zipcode": address_zipcode,
					"address_state": address_state,
					"address_city": address_city,
					"address_district": address_district,
					"address_street": address_street,
					"address_house_number": address_house_number,
					"phone": phone,
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}, function (response) {

				return response;

			})
		}
	}
}]);
app.votolegal.factory('payment_doacao', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {
		payment: function (id, name, cpf, phone, birthdate) {
			return $http({
				method: 'POST',
				url: BASE_API_JS + '/candidate/' + id + '/donate',
				data: serialize.from_object({
					"name": name,
					"cpf": cpf,
					"birthdate": birthdate,
					"phone": phone,
					"method": "boleto"
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
		}
	}
}]);
app.votolegal.factory('certi_face_token', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {
		tokenVerify: function (token) {

			return $http({
				method: 'POST',
				url: BASE_API_JS + '/certiface/token/validate?token=' + token,
			})
		}
	}

}]);

app.votolegal.factory('site_publish_service', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {

		edit: function (publish, user) {

			return $http({
				method: 'POST',
				url: BASE_API_JS + '/candidate/' + user.id + '/' + publish + "?api_key=" + user.api_key,

			})
		}
	}

}]);

app.votolegal.factory('color_theme_service', ['$http', 'serialize', 'store', function ($http, serialize, store) {

	return {

		edit: function (color, user) {
			console.log(color)
			return $http({
				method: 'PUT',
				url: BASE_API_JS + '/candidate/' + user.id + '/?color=' + color.theme + "&api_key=" + user.api_key,

			})
		}
	}

}]);




app.votolegal.controller('MenuController', ['$scope', '$http', 'serialize', 'auth_service', function ($scope, $http, serialize, auth_service) {
	$scope.current_user = auth_service.current_user() || {};

	$scope.is_admin = function () {
		var user = auth_service.current_user();
		if (user && user.role == 'user') return true;
		return false;
	};

	$scope.logout = function () {
		auth_service.logout('/');
		localStorage.removeItem('userId');
		return false;
	};
}]);

/**
 * load votolegal controllers
 */


//})(window.app = window.app || {});



$(document).ready(function () {
	//sobreescrevendo a função de recarregamento de página ao fazer click nos links com # para que os nav-tabs do bootstrap funcionem corretamente
	$('body').on('click', '.nav-tabs li a', function (e) {
		e.preventDefault();
	});

	$.getJSON("/stats", function (res) {
		$('#candidates').html(res.candidates);
		$('#total_donations').html(res.total_donations);
		$('#total_people_donated').html(res.total_people_donated);
		$('#total_amount_raised').html((function () {
			var formater = new BrazilianCurrency(res.total_amount_raised);
			return formater.format({
				simbol: false
			});
		}()));
		$('#totals').removeClass('hide');
	});
});
