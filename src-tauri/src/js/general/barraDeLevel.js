function retrieveWindowVariables( variables ) {
    const ret = {};
  
    let scriptContent = '';
    for ( let i = 0; i < variables.length; i++ ) {
      const currVariable = variables[i];
      scriptContent +=
        'if (typeof ' +
        currVariable +
        ' !== \'undefined\') $(\'body\').attr(\'tmp_' +
        currVariable +
        '\', ' +
        currVariable +
        ');\n';
    }
  
    const script = document.createElement( 'script' );
    script.id = 'tmpScript';
    script.appendChild( document.createTextNode( scriptContent ) );
    ( document.body || document.head || document.documentElement ).appendChild( script );
  
    for ( let i = 0; i < variables.length; i++ ) {
      const currVariable = variables[i];
      ret[currVariable] = $( 'body' ).attr( 'tmp_' + currVariable );
      $( 'body' ).removeAttr( 'tmp_' + currVariable );
    }
  
    $( '#tmpScript' ).remove();
  
    return ret;
}
const levelRatingXP = [
    1000,
    1056,
    1116,
    1179,
    1246,
    1316,
    1390,
    1469,
    1552,
    1639,
    1732,
    1830,
    1933,
    2042,
    2158,
    2280,
    2408,
    2544,
    2688,
    2840,
    2999,
    3000
];
const levelColor = [
    '#000',
    '#643284',
    '#5c2d84',
    '#532883',
    '#492381',
    '#402686',
    '#2d3a8a',
    '#2967b0',
    '#2967b0',
    '#2a7bc2',
    '#2a8acc',
    '#3e9cb7',
    '#53a18b',
    '#68a761',
    '#7cac35',
    '#91b20a',
    '#bdb700',
    '#f0bc00',
    '#f89a06',
    '#f46e12',
    '#eb2f2f',
    '#ff00c0'
];
function XpRangeFromLevel( level ) {
  return {
    minRating: levelRatingXP[level - 1],
    maxRating: levelRatingXP[level]
  };
}
const grabPlayerLastMatch = async matchUrl => {
  const response = await fetch( matchUrl );
  const data = await response.json();

  const lastMatchIndex = data.lastMatches.length - 1;
  const playerInfo = [];
  playerInfo['name'] = data.playerInfo ? data.playerInfo.nick : undefined;
  playerInfo['level'] = parseInt( data.playerInfo.level );
  playerInfo['currentRating'] = data.playerInfo.rating;
  playerInfo['matchId'] = data.lastMatches[lastMatchIndex].id;
  playerInfo['rating_points'] = data.lastMatches[lastMatchIndex].ratingDiff.toString();
  playerInfo['map_name'] = data.lastMatches[lastMatchIndex].map;

  return playerInfo;
};
const adicionarBarraLevel = async () => {
  const GC_URL = window.location.hostname;
  const windowVariables = retrieveWindowVariables( [ 'ISSUBSCRIBER', 'PLAYERID' ] );
  const isSubscriber = windowVariables.ISSUBSCRIBER;
  const playerId = windowVariables.PLAYERID;
  const playerInfo = await grabPlayerLastMatch( `https://${GC_URL}/api/box/init/${playerId}` );

  const playerLevel = playerInfo['level'];
  const currentRating = playerInfo['currentRating'];
  const ratingPoints = playerInfo['rating_points'];
  const matchId = playerInfo['matchId'];

  const minPontos = XpRangeFromLevel( playerLevel ).minRating;
  const maxPontos = XpRangeFromLevel( playerLevel ).maxRating;

  const pontosCair = minPontos - currentRating;
  const pontosSubir = maxPontos - currentRating;

  const playerNextLevel = playerLevel + 1 > 21 ? '' : playerLevel + 1;

  const colorTxt = ratingPoints.includes( '-' ) ? '#ef2f2f' : '#839800';
  const qwertText = '\nClique aqui para ir para a partida!';

  const fixedNum = ( ( ( currentRating - minPontos ) * 100 ) / ( maxPontos - minPontos ) ).toFixed( 2 ) + '%';
  const subscriberStyle = isSubscriber === 'true' ? 'subscriber' : 'nonSubscriber';

  const containerDiv = $( '<div>' ).css( {
    'display': 'flex',
    'align-items': 'center',
    'font-size': '11px',
    'justify-content': 'center',
    'width': '100%',
    'margin': '10px',
    'id': 'barraLevel'
  } );

  const currentLevelSpan = $( '<span>' )
    .attr( 'title', `Skill Level ${playerLevel}` )
    .attr( 'data-tip-text', `Skill Level ${playerLevel}` )
    .css( { 'cursor': 'help', 'display': 'inline-block' } )
    .append(
      $( '<div>' )
        .attr( 'class', `PlayerLevel PlayerLevel--${playerLevel} PlayerLevel--${subscriberStyle}` )
        .css( { 'height': '24px', 'width': '24px' } )
        .append(
          $( '<div>' )
            .attr( 'class', 'PlayerLevel__background' )
            .append(
              $( '<span>' )
                .attr( 'class', 'PlayerLevel__text' )
                .text( playerLevel )
            )
        )
    );

  const nextLevelSpan = $( '<span>' )
    .attr( 'title', `Skill Level ${playerNextLevel}` )
    .attr( 'data-tip-text', `Skill Level ${playerNextLevel}` )
    .css( { 'cursor': 'help', 'display': 'inline-block' } )
    .append(
      $( '<div>' )
        .attr( 'class', `PlayerLevel PlayerLevel--${playerNextLevel} PlayerLevel--${subscriberStyle}` )
        .css( { 'height': '24px', 'width': '24px' } )
        .append(
          $( '<div>' )
            .attr( 'class', 'PlayerLevel__background' )
            .append(
              $( '<span>' )
                .attr( 'class', 'PlayerLevel__text' )
                .text( playerNextLevel )
            )
        )
    );

  const progressBarDiv = $( '<div>' )
    .css( { 'margin-right': '4px', 'margin-left': '4px', 'width': '120px' } )
    .append(
      $( '<div>' )
        .attr( 'class', 'text-light' )
        .css( { 'display': 'flex', 'justify-content': 'space-between', 'width': '100%' } )
        .append(
          $( '<div>' )
            .attr( 'class', 'text-sm text-muted bold' )
            .css( { 'align-self': 'flex-end' } )
            .append( $( '<a>' )
              .attr( 'href', matchId ? `//${GC_URL}/lobby/partida/${matchId}` : `//${GC_URL}/my-matches` )
              .append( $( '<span>' )
                .css( { 'color': colorTxt, 'cursor': 'pointer' } )
                .text( ratingPoints.includes( '-' ) ? ratingPoints : '+' + ratingPoints )
                .attr( 'title', (
                  ratingPoints.includes( '-' ) ?
                    'Pontos que você perdeu na última partida' :
                    'Pontos que você ganhou na última partida' ) + qwertText )
              )
            )
        )
        .append(
          $( '<div>' )
            .css( { 'display': 'flex', 'align-items': 'center', 'justify-content': 'flex-end' } )
            .append( $( '<span>' )
              .css( { 'cursor': 'help' } )
              .attr( 'title', 'Rating atual' )
              .text( currentRating )
            )
            .append( $( '<i>' )
              .attr( 'class', 'fas fa-chart-line' )
              .css( { 'margin-left': '4px' } )
            )
        )
    ).append(
      $( '<div>' )
        .append( $( '<div>' )
          .css( { 'margin': '1px 0px', 'height': '2px', 'width': '100%', 'background': 'rgb(75, 78, 78)' } )
          .append( $( '<div>' )
            .css( {
              'height': '100%',
              'width': fixedNum,
              'background': 'linear-gradient(to right, ' +
              levelColor[playerLevel] + ', ' +
              levelColor[playerNextLevel] || levelColor[playerLevel] + ')'
            } )
          )
        )
        .append( $( '<div>' )
          .attr( 'class', 'text-sm text-muted' )
          .css( { 'display': 'flex', 'justify-content': 'space-between' } )
          .append( $( '<span>' )
            .text( minPontos )
          )
          .append( $( '<span>' )
            .append( $( '<span>' )
              .css( { 'cursor': 'help' } )
              .attr( 'title', 'Quantidade de pontos para cair de Level' )
              .text( pontosCair )
            )
            .append( $( '<span>' )
              .css( { 'cursor': 'help' } )
              .attr( 'title', 'Quantidade de pontos para subir de Level' )
              .text( '+' + pontosSubir )
            )
          )
          .append( $( '<span>' )
            .text( maxPontos > 2998 ? '∞' : maxPontos )
          )
        )
    );

  $( '.MainHeader__navbarBlock:last' )
    .before( containerDiv.append( currentLevelSpan ).append( progressBarDiv ).append( nextLevelSpan ) );

};

window.addEventListener("load", function() {
  if ( !document.getElementById( 'barraLevel' ) && typeof $ === 'function' ) {
    adicionarBarraLevel();
  }
} );
