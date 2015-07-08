/*global todomvc, angular, Firebase */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the $firebaseArray service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location, $firebaseArray) {
	var url = 'https://vecho.firebaseio.com/echo';
	var fireRef = new Firebase(url);

	// Bind the todos to the firebase provider.
	//$scope.todos = $firebaseArray(fireRef);

	var query = fireRef.orderByChild("echo").limitToFirst(25);
	$scope.todos = $firebaseArray(query);

	$scope.newTodo = '';
	$scope.editedTodo = null;

	$scope.$watch('todos', function () {
		var total = 0;
		var remaining = 0;
		$scope.todos.forEach(function (todo) {
			// Skip invalid entries so they don't break the entire app.
			if (!todo || !todo.head) {
				return;
			}

			total++;
			if (todo.completed === false) {
				remaining++;
			}
		});
		$scope.totalCount = total;
		$scope.remainingCount = remaining;
		$scope.completedCount = total - remaining;
		$scope.allChecked = remaining === 0;
	}, true);

	$scope.addTodo = function () {
		var newTodo = $scope.newTodo.trim();

		// No input, so just do nothing
		if (!newTodo.length) {
			return;
		}

		var head = newTodo;
		var desc = "";

		var firstCRPos = newTodo.indexOf('\n');
		if (firstCRPos != -1) {
			head = newTodo.slice(0, firstCRPos);
			desc = newTodo.slice(firstCRPos);
		}

		$scope.todos.$add({
			wholeMsg: newTodo,
			head: head,
			desc: desc,
			completed: false,
			echo: 0
		});
		$scope.newTodo = '';
	};

	$scope.editTodo = function (todo) {
		$scope.editedTodo = todo;
		$scope.originalTodo = angular.extend({}, $scope.editedTodo);
	};

	$scope.addEcho = function (todo) {
		$scope.editedTodo = todo;
		todo.echo = todo.echo+1;
		$scope.todos.$save(todo);
	};

	$scope.doneEditing = function (todo) {
		$scope.editedTodo = null;
		var wholeMsg = todo.wholeMsg.trim();
		if (wholeMsg) {
			$scope.todos.$save(todo);
		} else {
			$scope.removeTodo(todo);
		}
	};

	$scope.revertEditing = function (todo) {
		todo.wholeMsg = $scope.originalTodo.wholeMsg;
		$scope.doneEditing(todo);
	};

	$scope.removeTodo = function (todo) {
		$scope.todos.$remove(todo);
	};

	$scope.clearCompletedTodos = function () {
		$scope.todos.forEach(function (todo) {
			if (todo.completed) {
				$scope.removeTodo(todo);
			}
		});
	};

	$scope.markAll = function (allCompleted) {
		$scope.todos.forEach(function (todo) {
			todo.completed = allCompleted;
			$scope.todos.$save(todo);
		});
	};

	if ($location.path() === '') {
		$location.path('/');
	}
	$scope.location = $location;
});
