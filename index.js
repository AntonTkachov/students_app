// Yout js code goes here
'use strict';
var MIN_AGE = 1;
var MAX_AGE = 99;
var iterator = 0;
var studentSequence = JSON.parse(localStorage.getItem('studentSequence'));
if (!studentSequence) studentSequence = [];

$(function() {
	var $studentListingContainer = $('.student-listing-container').parent();
	var $studentDataContainer = $('.student-data-container').parent();
	var $studentFormContainer = $('.student-form-container').parent();
	var $studentForm = $('form');
	var $studentTableBody = $('tbody');

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

	function fillStudentForm(student) {
		$studentForm.data('id', student.id);
		$('.form-control.first-name').val(student.first_name);
		$('.form-control.last-name').val(student.last_name);
		$('.form-control.student-age').val(student.age);
		$('input.student-at-university').attr('checked', student.at_university);
		$('.student-course').parent().remove();
		$.each(student.courses, function(index, course) {
			addCourseInput(course);
		})
	}

	function resetStudentData() {
		$('.student-data-group span').empty();
		$('.course-group').parent().remove();
	}

	function resetStudentForm() {
		$studentForm.data('id', undefined);
		$('.form-control.first-name').val('');
		$('.form-control.last-name').val('');
		$('.form-control.student-age').val('Select age');
		$('input.student-at-university').attr('checked', false);
		$('.student-course').parent().remove();
		$('.alert-danger').hide();
		addCourseInput();
		addCourseInput();
	}

	function loadStudentsListing() {
		$studentTableBody.empty();
		$studentListingContainer.fadeIn(500);

		$.get({
			url: 'https://spalah-js-students.herokuapp.com/students',
			contentType: "application/json",
			dataType: 'json',
			success: function(students) {
				var student;
				var studentIds;
				var newStudentIds;
				var newStudents;

				$.each(studentSequence, function(index, id) {
					student = _.find(students.data, {id: id})
					if (student) $studentTableBody.append(Mustache.render(STUDENT_ROW_VIEW, student));
				});
				studentIds = _.map(students.data, 'id');
				newStudentIds = _.difference(studentIds, studentSequence);

				_(newStudentIds).forEach(function(id) {
					student = _.find(students.data,{id: id});
					$studentTableBody.append(Mustache.render(STUDENT_ROW_VIEW, student));
				});
			}
		});
	}

	function redrawCourseLabels() {
		$.each($('.form-control.student-course').prev('label'), function(index, label) {
			label.innerHTML = 'Course ' + (index + 1) + ':';
		});
	}

	function addCourseInput(courseName = undefined) {
		var $newCourseLabel = $('<label>');
		var $newCourseInput = $('<input>').attr('name', 'courses[]')
																	.addClass('form-control student-course');
		if (courseName) $newCourseInput.val(courseName);
		var $newCourseRemoveAnchor = $('<a>').attr('href', '#')
																				 .text('Remove course')
																		 		 .addClass('remove-course');
		var $newCourseContainer = $('<div>').addClass('form-group')
																				.append($newCourseLabel,
																						$newCourseInput,
																						$newCourseRemoveAnchor);
		$newCourseContainer.insertBefore('.student-form-container .form-group:last');

		redrawCourseLabels();
	}

	function showFormErrors(errors) {
		$('.alert-danger').fadeIn(500);
		$.each(errors, function(index, error) {
			var $errorLi = $('<li>').addClass('list-group-item').text(error);
			$('ul').append($errorLi);
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

	$(document).on('click', '.student-listing-container .btn-primary', function(event) {
		var studentId = $(this).parent().data('id');
		$studentListingContainer.fadeOut(500, function() {
			$studentFormContainer.fadeIn(500);
		});

		$.get({
			url: 'https://spalah-js-students.herokuapp.com/students/' + studentId,
			contentType: "application/json",
			dataType: 'json',
			success: function(student) {
				fillStudentForm(student.data);
			}
		})

		event.preventDefault();
	});

	$(document).on('click', '.student-data-container .btn-default', function(event) {
		$studentDataContainer.fadeOut(500, function() {
			loadStudentsListing();
			resetStudentData();
		});

		event.preventDefault();		
	});

	$(document).on('click', '.student-form-container a.btn-default', function(event) {
		$studentFormContainer.fadeOut(500, function() {
			loadStudentsListing();
			resetStudentForm();
		});

		event.preventDefault();
	});

	$(document).on('click', '.student-listing-container .btn-success', function(event) {
		$studentListingContainer.fadeOut(500, function() {
			$studentFormContainer.fadeIn(500);
		});

		event.preventDefault();
	});

	$studentForm.submit(function(event) {
		var studentId = $studentForm.data('id');
		var studentData = {student: {}};
		studentData.student.first_name = $('.form-control.first-name').val();
		studentData.student.last_name = $('.form-control.last-name').val();
		studentData.student.age = $('.form-control.student-age').val();
		studentData.student.at_university = $('input.student-at-university').prop('checked');
		studentData.student.courses = [];
		$.each($('.form-control.student-course'), function(index, courseInput) {
			studentData.student.courses.push(courseInput.value);
		});

		if (studentId) {
			$.ajax({
				url: 'https://spalah-js-students.herokuapp.com/students/' + studentId,
				method: 'PUT',
				data: studentData
			})
					.done(function(data) {
						if (data.errors) {
							showFormErrors(data.errors);
						} else {
							$studentListingContainer.find('.alert').show()
																			.html("User was successfully updated");
				  		$studentFormContainer.fadeOut(500, function() {
								loadStudentsListing();
								resetStudentForm();
							});
						}
					})
		} else {
			$.post('https://spalah-js-students.herokuapp.com/students/',
						  studentData, function(data) {
						  	if (data.errors) {
						  		showFormErrors(data.errors);
						  	} else {
						  		$studentListingContainer.find('.alert').show()
						  														.html("User was successfully created");
						  		$studentFormContainer.fadeOut(500, function() {
										loadStudentsListing();
										resetStudentForm();
									});
						  	}
						  });
		}

		event.preventDefault();
	});

	$(document).on('click', '.student-form-container .add-course', function(event) {
		addCourseInput();

		event.preventDefault();
	});

	$(document).on('click', '.student-form-container .remove-course', function(event) {
		$(this).parent().remove();

		redrawCourseLabels();

		event.preventDefault();
	});

	loadStudentsListing();
	$studentTableBody.empty();
	$studentDataContainer.hide();
	$studentFormContainer.hide();
	resetStudentData();

	$('.alert').hide();
	$('.alert-danger li').remove();
	for(iterator = MIN_AGE; iterator <= MAX_AGE; iterator++) {
		var $newOption = $('<option>').text(iterator).val(iterator);
		$('select.student-age').append($newOption);
	};

	$studentTableBody.sortable({
		deactivate: function(event, ui) {
			var studentSequence = []
			$.each($('tbody tr td:last-child'), function(index, td) {
				studentSequence.push($(td).data('id'));
			});
			localStorage.setItem('studentSequence', JSON.stringify(studentSequence));
		}
	});
});