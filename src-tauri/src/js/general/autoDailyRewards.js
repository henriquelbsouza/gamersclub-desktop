const coletarDailyRewards = async () => {
  const authToken = localStorage.getItem( 'gc:authToken' );
  const productSession = localStorage.getItem( 'gc:product' );
  const headers = {
    'authorization': `Bearer ${authToken}`,
    'x-product-session': `${productSession}`
  };

  axios.post( `https://missions-api.${ GC_URL }/player/daily-rewards/claim`, '', { headers } ).then( () => {
    localStorage.setItem( 'daily_rewards_claim_date', `"${new Date().toISOString()}"` );

    const dailyRewardsBtn = document.querySelector( '[href="/daily-rewards"]' );
    if ( dailyRewardsBtn ) {
      dailyRewardsBtn.querySelector( 'span.MainMenu__itemNewsIcon' )?.remove();
      dailyRewardsBtn.querySelector( '.MainMenu__itemLabel' ).classList.remove( 'MainMenu__itemLabel--hasNews' );
    }
  } );
};

window.addEventListener("load", function() {
  const dateFormat = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const currentDate = new Date().toLocaleDateString( dateFormat );
  const currentHours = new Date().getHours();
  const lastCollectDate = new Date( localStorage.getItem( 'daily_rewards_claim_date' ) ).toLocaleDateString( dateFormat );

  if ( currentDate !== lastCollectDate && currentHours >= 5 ) {
    coletarDailyRewards();
  }
} );
