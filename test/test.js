var assert = require('assert'),
    stringlistRegExp = require('../index'),
    strings = [
      'test',
      'foo',
      'bar',
      'baz',
      'testing',
      'foo bar'
    ];

describe('stringlist-regexp', function(){
  it('should create a (regexp) string that matches from start and to end of strings given', function(){
    var regExp = new RegExp( stringlistRegExp( strings ) );

    strings.forEach( function( string ) {
      var match = regExp.exec( string );
      assert.equal( !match, false );
      assert.equal( match[1], string );

      var matchInside = regExp.exec( 'yes, ' + string + ', but no.' );
      assert.equal( matchInside, null );
    } );

  });

  it('should create a (regexp) string that matches start of strings given', function(){
    var regExp = new RegExp( stringlistRegExp( strings, true, false ) );
    
    strings.forEach( function( string ) {
      var matchBeginning = regExp.exec( string + ' and something else' );
      assert.equal( !matchBeginning, false );
      assert.equal( matchBeginning[1], string );

      var matchEnding = regExp.exec( 'This won\'t work: ' + string );
      assert.equal( matchEnding, null );
    } );
  } );

  it('should create a (regexp) string that matches end of strings given', function(){
    var regExp = new RegExp( stringlistRegExp( strings, false, true ) );
    
    strings.forEach( function( string ) {
      var matchEnding = regExp.exec( 'I expect a match here: ' + string );
      assert.equal( !matchEnding, false );
      assert.equal( matchEnding[1], string );

      var matchBeginning = regExp.exec( string + ' is not supposed to work.' );

      assert.equal( matchBeginning, null );
    } );
  } );

  it('should create a (regexp) string that matches somewhere in strings given', function(){
    var regExp = new RegExp( stringlistRegExp( strings, false, false ) );
    
    strings.forEach( function( string ) {
      var matchSomewhere = regExp.exec( 'I expect this ' + string + ' to match.' );
      assert.equal( !matchSomewhere, false );
      assert.equal( matchSomewhere[1], string );
    } );
  } );
});
    
