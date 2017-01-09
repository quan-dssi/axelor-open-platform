/*
 * Axelor Business Solutions
 *
 * Copyright (C) 2005-2016 Axelor (<http://axelor.com>).
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {

"use strict";

var ui = angular.module('axelor.ui');

ui.formInput('JsonField', 'String', {
	showTitle: false,
	link: function (scope, element, attrs, model) {
		var field = scope.field;
		var jsonFields = field.jsonFields || [];

		var defaultValues = {};
		var parentUnwatch = null;
		var selfUnwatch = null;

		scope.formPath = scope.formPath ? scope.formPath + "." + field.name : field.name;
		scope.record = {};

		function getDefaultValues() {
			jsonFields.forEach(function (item) {
				if (item.defaultValue === undefined) return;
				var value = item.defaultValue;
				switch(item.type) {
				case 'integer':
					value = +(value);
					break;
				case 'date':
				case 'datetime':
					value = value === 'now' ? new Date() : moment(value).toDate();
					break;
				}
				defaultValues[item.name] = value;
			});
			return angular.copy(defaultValues);
		}

		function unwatchParent() {
			if (parentUnwatch) {
				parentUnwatch();
				parentUnwatch = null;
			}
		}

		function unwatchSelf() {
			if (selfUnwatch) {
				selfUnwatch();
				selfUnwatch = null;
			}
		}

		function watchParent() {
			unwatchParent();
			parentUnwatch = scope.$watch('$parent.record.' + field.name, function (value, old) {
				if (value === old) return;
				onRender();
			});
		}

		function watchSelf() {
			unwatchSelf();
			selfUnwatch = scope.$watch('record', function (record, old) {
				if (record === old || angular.equals(record, defaultValues)) return;
				onUpdate();
			}, true);
		}

		function onUpdate() {
			var rec = null;
			_.each(scope.record, function (v, k) {
				if (k.indexOf('$') === 0 || v === null || v === undefined) return;
				if (rec === null) {
					rec = {};
				}
				rec[k] = v;
			});
			unwatchParent();
			if (scope.$parent.record[field.name] || rec) {
				scope.$parent.record[field.name] = rec ? angular.toJson(rec) : rec;
			}
			watchParent();
		}

		function onRender() {
			var value = scope.$parent.record[field.name];
			unwatchSelf();
			scope.record = value ? angular.fromJson(value) : getDefaultValues();
			watchSelf();
		}

		scope.$on('on:new', onRender);
		scope.$on('on:edit', function () {
			if (scope.viewType === 'form') onRender();
		});

		watchParent();
	}
});

ui.formInput('JsonRefSelect', {

	css: 'multi-object-select',

	controller: ['$scope', 'ViewService', function($scope, ViewService) {

		$scope.createElement = function(id, name, selectionList) {

			var elemGroup = $('<div ui-group ui-table-layout cols="2" x-widths="150,*"></div>');
			var elemSelect = $('<input ui-select showTitle="false">')
				.attr("name", name + "$model")
				.attr("x-for-widget", id)
				.attr("ng-model", "record." + name + ".model");

			var elemSelects = $('<div></div>').attr('ng-switch', "record." + name + ".model");
			var elemItems = _.map(selectionList, function(s) {
				return $('<input ui-json-ref-item ng-switch-when="' + s.value +'">')
					.attr('ng-model', 'record.' + name)
					.attr('name', name)
					.attr('x-target', s.value);
			});

			elemGroup
				.append($('<div></div>').append(elemSelect))
				.append(elemSelects.append(elemItems));

			return ViewService.compile(elemGroup)($scope);
		};
	}],

	link: function(scope, element, attrs, model) {
		this._super.apply(this, arguments);

		var name = scope.field.name;
		var selectionList = scope.field.selectionList;

		scope.fieldsCache = {};

		scope.refFireEvent = function (name) {
			var handler = scope.$events[name];
			if (handler) {
				return handler();
			}
		};

		var elem = scope.createElement(element.attr('id'), name, selectionList);
		setTimeout(function() {
			element.append(elem);
		});

		scope.$watch("record." + name + ".model", function (value, old) {
			if (value === old || old === undefined) return;
			if (scope.record && scope.record[name]) {
				scope.record[name] = _.pick(scope.record[name], 'model');
				if (!scope.record[name].model) {
					delete scope.record[name];
				}
			}
		});
	},
	template_editable: null,
	template_readonly: null
});

ui.formInput('JsonRefItem', 'ManyToOne', {

	showTitle: false,

	link: function(scope, element, attrs, model) {
		this._super.apply(this, arguments);

		if (scope.field.targetName) {
			return this._link.apply(this, arguments);
		}

		var self = this;
		var target = element.attr('x-target');
		var data = (_.findWhere(scope.$parent.field.selectionList, {value: target})||{}).data || {};
		
		function doLink(fields) {
			var name = false,
				search = [];

			_.each(fields, function(f) {
				if (f.nameColumn) name = f.name;
				if (f.name === "name") search.push("name");
				if (f.name === "code") search.push("code");
			});

			if (!name && _.contains(search, "name")) {
				name = "name";
			}

			_.extend(scope.field, {
				target: scope._model,
				targetName: name,
				targetSearch: search,
				domain: data.domain
			});

			self._link(scope, element, attrs, model);
		}

		if (scope.fieldsCache[scope._model]) {
			doLink(scope.fieldsCache[scope._model]);
		} else {
			scope.loadFields().success(function (fields) {
				scope.fieldsCache[scope._model] = fields;
				doLink(fields);
			});
		}
	},

	_link: function(scope, element, attrs, model) {
		var name = element.attr('name');
		
		scope.getValue = function () {
			return scope.record[name];
		}
		
		var __setValue = scope.setValue;
		
		scope.setValue = function (value) {
			var val = _.pick(scope.record[name], 'model');
			val = _.extend(val, value);
			__setValue.call(scope, val);
		}

		function doSelect() {
			var value = (scope.record || {})[name];
			scope.select(value);
		}

		scope.$watch("record", doSelect);
	}
});

})();
