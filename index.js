/**
 * [exports description]
 * @param  {[strings]} list       an array of strings
 * @param  {Boolean} matchStart whether to make the resulting regex start with ^
 * @param  {Boolean} matchEnd   whether to make the resulting regex leafs end with $
 * @return {String regex}            optimized regex for the list of strings
 */
module.exports = function convertStringListToRegExpString( list, matchStart, matchEnd ) {
  if( matchStart === undefined ) matchStart = true;

  if( matchEnd === undefined ) matchEnd = true;

  if( matchStart ) list = list.map( prependCircumflex );

  if( matchEnd ) list = list.map( appendDollar );

  var regExpString = makeRegexString( simplify( createTree( list ) ), true );

  if( !regExpString ) {
    if( matchStart ) regExpString += '^';
    if( matchEnd ) regExpString += '$';
    regExpString = '(' + regExpString + ')';
  }

  return regExpString;
};

/**
 * Creates a linked list tree with the strings supplied.
 * example: pass ['hoi', 'hola', 'daag', 'dansje'], returns:
 * {
 *      h: {
 *          o: {
 *              i: {},
 *              l: { a: {} }
 *          }
 *      },
 *      d: {
 *          a: {
 *              a: { g: {} },
 *              n: {
 *                  s: {
 *                      j: { e: {} }
 *                  }
 *              }
 *          }
 *      }
 *  }
 * @param  {[strings]} list the strings to make the tree from
 * @return {Object}      An object showing all overlaps
 */
function createTree(list) {
  var tree = {},
      objectToStoreIn;

  list.forEach( addItemToTree );

  return tree;

  function addItemToTree( item ) {
    // reset objectToStoreIn to trunk
    objectToStoreIn = tree;

    // escape parentheses
    item = item.replace( '(', '\\(' );
    item = item.replace( ')', '\\)' );

    item.split('').forEach( addCharacterToTree );

    Object.defineProperty( objectToStoreIn, 'isLast', { value: true } );
  }

  function addCharacterToTree( character ) {
    objectToStoreIn[character] = objectToStoreIn[character] || {};
    objectToStoreIn = objectToStoreIn[character];
  }
}

/**
 * Simplifies a tree object
 * * example: pass
 * {
 *      h: {
 *          o: {
 *              i: {},
 *              l: { a: {} }
 *          }
 *      },
 *      d: {
 *          a: {
 *              a: { g: {} },
 *              n: {
 *                  s: {
 *                      j: { e: {} }
 *                  }
 *              }
 *          }
 *      }
 *  }, returns:
 * {
 *      ho: {
 *          i: {},
 *          la: {}
 *      },
 *      da: {
 *          ag: {},
 *          nsje: {}
 *      }
 *  }
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
function simplify( object ) {
  Object.keys( object ).forEach( simplifyChildren );
  
  return object;

  function simplifyChildren( key ) {
    var subObject = object[key],
        subKeys = Object.keys(subObject),
        newKey;

    while( subKeys.length === 1 && !subObject.isLast ){
      newKey = key + subKeys[0];
      object[newKey] = subObject[subKeys[0]];
      delete object[key];
      subObject = object[newKey];
      subKeys = Object.keys( subObject );
      key = newKey;
    }

    object[key] = simplify(subObject);
    if(subObject.isLast){
      Object.defineProperty(object, 'terminates', { value: true });
    }
  }
}

/**
 * Pass a tree, get a regex string back
 * example: pass
 * {
 *      ho: {
 *          i: {},
 *          la: {}
 *      },
 *      da: {
 *          ag: {},
 *          nsje: {}
 *      }
 * }, return:
 * '(ho(i|la)|da(ag|nsje))'
 * @param  {Object} tree the tree as shown above
 * @return {String}      'regex' string
 */
function makeRegexString( tree, isRoot ) {
  var subRegexes = [],
      foundTerminator;

  Object.keys( tree ).forEach( makeRegexPart );

  if(subRegexes.length){
    subRegexes.forEach( findTerminator ); // if terminator found, don't append ? as it means this part is not optional
    return '(' + subRegexes.join('|') + ')' + ( ( !foundTerminator && !isRoot && tree.terminates ) ? '?' : '' ); // if root don't consider this part optional
  }

  return '';

  function makeRegexPart( key ) {
    subRegexes.push( key + makeRegexString( tree[key], isRoot && key === '^' ) );
  }

  function findTerminator( string ){
    foundTerminator = foundTerminator || string.indexOf('$') > -1;
  }
}

function prependCircumflex( string ) { return '^' + string; }
function appendDollar( string ) { return string + '$'; }

