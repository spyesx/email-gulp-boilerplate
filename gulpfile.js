'use strict';

// Include Gulp & Tools
var gulp         = require('gulp');
var premailer    = require('gulp-premailer');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var csso         = require('gulp-csso');
var imagemin     = require('gulp-imagemin');
var gutil        = require('gulp-util');
var filter       = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var plumber      = require('gulp-plumber');
var del          = require('del');
var twig         = require('gulp-twig');
var yaml         = require('js-yaml');
var fs           = require('fs');
var rename       = require('gulp-rename');
var del          = require('del');
var inlineCss    = require('gulp-inline-css');
var ical         = require('ical-generator');
var runSequence = require('run-sequence');


// Compile all SCSS files to CSS and copy to app/css
gulp.task('sass', function() {
  return gulp.src('src/sass/*.scss')
	   .pipe(plumber(function(error) {
			gutil.log(gutil.colors.red(error.message));
			gutil.beep();
			this.emit('end');
		}))
	  // .pipe(sourcemaps.init())
	   .pipe(sass({
		  precision: 10
		}))
	   //.pipe(sourcemaps.write('./maps'))
	   .pipe(autoprefixer({
			browsers: ['last 2 versions', 'ie 8', 'ie 9'],
			cascade: true
		}))
	   .pipe(gulp.dest('build/css'));
});

// compressing images & handle SVG files
gulp.task('images', function() {
	gulp.src(['./src/img/**/*'])
		.pipe(imagemin({ optimizationLevel: 1, progressive: true, interlaced: true }))
		.pipe(gulp.dest('./build/img/'));
});


// DEPLOY: Place all CSS inline and copy html files to build
gulp.task('inline', function() {
  return gulp.src(['./build/**/*.html'])
	.pipe(inlineCss({
		applyStyleTags: true,
		applyLinkTags: true,
		removeStyleTags: false,
		removeLinkTags: true
	}))
	.pipe(gulp.dest('./dist/'));
});

// Twig task
gulp.task('twig', function ()
{
	del.sync('build/announcement/*.html');
	del.sync('build/invite/*.html');
	del.sync('build/reminder/*.html');
	del.sync('build/thanks/*.html');

	// CONFIG
	var config = yaml.safeLoad( fs.readFileSync('src/yaml/config.yml', 'utf8') );
	//gutil.log(config);
	config = JSON.parse(JSON.stringify(config));

	// JSON pages
	var pages = fs.readFileSync('src/json/pages.json', 'utf8');
	pages = JSON.parse(pages);

	// PAGES pages
	for(var i = 0; i < pages.length; i++)
	{

		var fileName = pages[i].filename;


		// JPEG annoucement
		gulp.src('src/twig/announcement.twig')
			.pipe(twig({
				data: {
					datas : pages[i],
					config : config
				}
			}))
			.pipe(rename('announcement/'+fileName+'.html'))
			.pipe(gulp.dest('./build/'));

		// JPEG invite
		gulp.src('src/twig/invite.twig')
			.pipe(twig({
				data: {
					datas : pages[i],
					config : config
				}
			}))
			.pipe(rename('invite/'+fileName+'.html'))
			.pipe(gulp.dest('./build/'));

		// JPEG reminder
		gulp.src('src/twig/reminder.twig')
			.pipe(twig({
				data: {
					datas : pages[i],
					config : config
				}
			}))
			.pipe(rename('reminder/'+fileName+'.html'))
			.pipe(gulp.dest('./build/'));

		// JPEG thanks
		gulp.src('src/twig/thanks.twig')
			.pipe(twig({
				data: {
					datas : pages[i],
					config : config
				}
			}))
			.pipe(rename('thanks/'+fileName+'.html'))
			.pipe(gulp.dest('./build/'));
  }


});


// iCalendar task
gulp.task('ical', function ()
{
  del.sync('build/ical/*');

  // CONFIG
  var config = yaml.safeLoad( fs.readFileSync('src/yaml/config.yml', 'utf8') );

  config = JSON.parse(JSON.stringify(config));

  // JSON pages
  var pages = fs.readFileSync('src/json/pages.json', 'utf8');
  pages = JSON.parse(pages);

  // PAGES pages
  for(var i = 0; i < pages.length; i++)
  {
	  var cal = ical({
		  domain: config.ical.domain,
		  prodId: {company: config.ical.domain, product: 'ical-generator'},
		  name: config.ical.summary,
		  timezone: config.ical.timezone,
		  language: config.ical.language
	  });

	  var details = pages[i];

	  cal.addEvent({
		start       : new Date(details.start.year, details.start.month, details.start.day, details.start.hours, details.start.minutes, 0, 0),
		end         : new Date(details.end.year, details.end.month, details.end.day, details.end.hours, details.end.minutes, 0, 0),
		summary     : config.ical.summary,
		description : config.ical.description.replace('{{details.date}}', details.date),
		organizer   : {
			name    : config.ical.organizer,
			email   : config.ical.organizerEmail
		},
		url         : details.url,
		location    : config.ical.location
	  });

	  fs.writeFile('build/ical/'+details.filename+'.ical', cal.toString(), function (err) {
		if (err) return console.error(err);
	  });
  }


});


// DEPLOY task

gulp.task('dist', function() {

  runSequence(['sass', 'twig', 'images', 'ical'], 'inline');

});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['dist']));

// Watch all changed files and perform its respective action
gulp.task('watch', function() {
	gulp.watch('./src/sass/**/*', ['sass']);
	gulp.watch('./src/img/**/*', ['images']);
	gulp.watch('./src/twig/**/*.twig', ['twig']);
	gulp.watch('./src/yaml/**/*.yml', ['twig', 'ical']);
	gulp.watch('./src/json/**/*.json', ['twig', 'ical']);
});

////////////////////
// Default Gulp task
gulp.task('dev', ['sass', 'images', 'twig', 'ical', 'watch']);