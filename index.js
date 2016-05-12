// Yout js code goes here
'use strict';

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

	$('body').on('click', 'a', function(event) {
		if ($(this).html() == 'Show') {
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
		} else if ($(this).html() == 'Back') {
			$studentDataContainer.fadeOut(500, function() {
				$studentListingContainer.fadeIn(500);
				resetStudentData();
			});
		}

		event.preventDefault();
	});

	$studentTableBody.empty();
	$studentDataContainer.hide();
	$studentFormContainer.hide();
	resetStudentData();
});