// Yout js code goes here
'use strict';
var MIN_AGE = 16;
var MAX_AGE = 70;
var iterator = 0;

$(function() {
	var $studentListingContainer = $('.student-listing-container').parent();
	var $studentDataContainer = $('.student-data-container').parent();
	var $studentFormContainer = $('.student-form-container').parent();
	var $studentTableBody = $('tbody');

	function studentRowView(student) {
		var $firstNameTd = $('<td>').html(student.first_name);
		var $lastNameTd = $('<td>').html(student.last_name);
		var $studentShowAnchor = $('<a>').html('Show').addClass('btn btn-default')
																 .attr('href', '#');
		var $studentEditAnchor = $('<a>').html('Edit').addClass('btn btn-primary')
																 .attr('href', '#');
		var $studentDeleteAnchor = $('<a>').html('Delete').addClass('btn btn-danger')
																 .attr('href', '#');
		var $actionsTd = $('<td>').data('id', student.id)
															.append($studentShowAnchor,
																			$studentEditAnchor,
																			$studentDeleteAnchor);
		return $('<tr>').append($firstNameTd, $lastNameTd, $actionsTd);
	}

	function fillStudentData(student) {
		$('span.student-full-name').html(student.first_name + ' ' + student.last_name);
		$('span.student-age').html(student.age);
		$('span.student-at-university').html(student.at_university ? 'Yes' : 'No');
		$.each(student.courses, function(index, course) {
			$studentDataContainer.find('.student-data').append(
				$('<div>').addClass('student-data-group').append(
					$('<div>').addClass('course-group').append(
						$('<b>').text('Course' + (index + 1) + ": "),
						$('<span>').addClass('student-course').text(course)
					)
				)
			);
		});
	}

	function resetStudentData() {
		$('.student-data-group span').empty();
		$('.course-group').parent().remove();
	}

	function loadStudents() {
		$.get({
			url: 'https://spalah-js-students.herokuapp.com/students',
			contentType: "application/json",
			dataType: 'json',
			success: function(students) {
				$.each(students.data, function(index, student) {
					$studentTableBody.append(studentRowView(student));
				});
			}
		});
	}

	$(document).on('click', '.student-listing-container .btn-default', function(event) {
		var studentId = $(this).parent().data('id');
		$studentListingContainer.fadeOut(500, function() {
			$studentDataContainer.fadeIn(500);
		});

		$.get({
			url: 'https://spalah-js-students.herokuapp.com/students/' + studentId,
			contentType: "application/json",
			dataType: 'json',
			success: function(student) {
				fillStudentData(student.data);
			}
		})

		event.preventDefault();
	});

	$(document).on('click', '.student-data-container .btn-default', function(event) {
		$studentDataContainer.fadeOut(500, function() {
			$studentListingContainer.fadeIn(500);
			resetStudentData();
		});

		loadStudents();
		event.preventDefault();		
	});

	$(document).on('click', '.student-listing-container .btn-success', function(event) {
		$studentListingContainer.fadeOut(500, function() {
			$studentFormContainer.fadeIn(500);
		});

		event.preventDefault();
	});

	$('form').submit(function(event) {
		var new_student_data = {student:{first_name: ''}};
		$.post('https://spalah-js-students.herokuapp.com/students/',
					  new_student_data, function(data) {
					  	if (data.errors) {
					  		$('.alert-danger').fadeIn(500);
					  		$.each(data.errors, function(index, error) {
					  			var $error_li = $('<li>').addClass('list-group-item').text(error);
					  			$('ul').append($error_li);
					  		});
					  	} else {

					  	}
					  });

		event.preventDefault();
	});

	loadStudents();
	$studentTableBody.empty();
	$studentDataContainer.hide();
	$studentFormContainer.hide();
	resetStudentData();
	$('.alert').hide();
	$('.alert-danger li').remove();
	for(iterator = MIN_AGE; iterator <= MAX_AGE; iterator++) {
		var $new_option = $('<option>').text(iterator).val(iterator);
		$('select.student-age').append($new_option);
	};
});