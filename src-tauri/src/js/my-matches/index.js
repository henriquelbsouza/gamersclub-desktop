const SELETOR_LINK_PARTIDAS = 'a:contains("Ver partida")';

const buscaLinksDasPartidas = () => {
  const partidas = [];
  window.$( SELETOR_LINK_PARTIDAS ).each( function () {
    partidas.push( this.href );
  } );
  return partidas;
};

const verificarBans = async ( partida, statsColumns, retries = 0 ) => {
  if ( retries > 3 ) {
    return;
  }
  try {
    const resposta = await fetch( partida + '/1' );
    const dadosPartida = await resposta.json();
    const temBanidos =
      dadosPartida.jogos.players.team_a.some( jogador => jogador.player.banned ) ||
      dadosPartida.jogos.players.team_b.some( jogador => jogador.player.banned );
    if ( temBanidos ) {
      window.$( statsColumns ).children( '.medium-offset-1' ).removeClass( 'medium-offset-1' );
      window.$( statsColumns ).prepend(
        window.$( '<div></div>' )
          .addClass( 'columns medium-1' )
          .attr( 'title', 'Esta partida possui jogador banido' )
          .append(
            window.$( '<i></i>' )
              .addClass( 'fa fa-exclamation-triangle' )
              .attr( 'aria-hidden', true )
              .css( { 'color': 'red', 'font-size': '35px', 'margin-top': '5px' } )
          )
      );
    } else {
      window.$( statsColumns ).children( '.medium-offset-1' ).removeClass( 'medium-offset-1' );
      window.$( statsColumns ).prepend(
        window.$( '<div></div>' )
          .addClass( 'columns medium-1' )
          .attr( 'title', 'Não há jogadores banidos nesta partida' )
          .append(
            window.$( '<i></i>' )
              .addClass( 'fa fa-check-circle' )
              .attr( 'aria-hidden', true )
              .css( { 'color': 'green', 'font-size': '35px', 'margin-top': '5px' } )
          )
      );
    }
  } catch ( e ) {
    return setTimeout( async () => {
      verificarBans( partida, statsColumns, retries + 1 );
    }, 1000 );
  }
};

// content.js
const initVerificarBans = async () => {
  const partidas = buscaLinksDasPartidas();
  const statsColumns = window.$( SELETOR_LINK_PARTIDAS ).parent().parent();
  let waitTime = 0;
  const promises = partidas.map( ( partida, index ) => {
    waitTime += 100;
    return setTimeout( async () => {
      return verificarBans( partida, statsColumns[index] );
    }, waitTime );
  } );
  await Promise.all( promises );
};
const colorirPartidas = () => {
  const matches = window.$( '.match.columns' );
  matches.each( function () {
    let placarMeuTime;
    let placarAdversario;
    let cor;
    if ( this.children[1].children.length > 1 ) {
      placarMeuTime = +this.children[2].textContent;
      placarAdversario = +this.children[4].textContent;
    } else {
      placarMeuTime = +this.children[4].textContent;
      placarAdversario = +this.children[2].textContent;
    }
    if ( placarMeuTime > placarAdversario ) {
      cor = 'rgba(22,229,180,.25) 0';
    } else if ( placarMeuTime < placarAdversario ) {
      cor = 'rgba(220,20,0,.25) 0';
    } else {
      cor = '#cdcf57';
    }
    this.style = `background-image: linear-gradient(90deg, ${cor},transparent 40%);`;
  } );
};
const startMyMatches = async () => {
  window.$( 'body' ).on( 'change', '#dateFilterMatches, #myMatchesPagination .block-mobile', async function () {
    await new Promise( r => setTimeout( r, 3000 ) );
    initVerificarBans();
    colorirPartidas();
  } );
  window.$( 'body' ).on( 'click', '#myMatchesPagination', async function () {
    await new Promise( r => setTimeout( r, 3000 ) );
    initVerificarBans();
    colorirPartidas();
  } );
  await new Promise( r => setTimeout( r, 3000 ) );
  colorirPartidas();
  await initVerificarBans();
};

window.addEventListener( "load", function() {
  if ( typeof $ === 'function' ) {
    startMyMatches();
  }
} );

