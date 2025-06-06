import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>TAITAJA TIETOTESTI</div>
        <Link href="/login" className={styles.loginLink}>
          Kirjaudu sisään
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <h1 className={styles.title}>
              Taitaja<br />
              TietoTesti
            </h1>
            <h2 className={styles.description}>
              Haluatko testata tietosi? </h2>
            <p>
              Nyt se onnistuu! Valitse opettaja ja aihelue, ja aloita!
            </p>
            <Link href="/game">
              <button className={styles.playButton}>
                Pelaa nyt
              </button>
            </Link>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDot}></div>
              <div className={styles.browserDot}></div>
              <div className={styles.browserDot}></div>
            </div>
            
            <div className={styles.gamePreview}>
              <div className={styles.gameTitle}>TAITAJA TIETOTESTI</div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                Kysymys 4/10<br />
                Pisteet: 3
              </div>
              <div className={styles.question}>
                Mitä CSS tekee verkkosivulla?
              </div>
              <div className={styles.options}>
                <div className={styles.option}>Määrittää ulkoasun</div>
                <div className={styles.option}>Tallentaa tietoja</div>
                <div className={`${styles.option} ${styles.selected}`}>Lisää toiminnallisuutta</div>
                <div className={styles.option}>Hoitaa tietoturvaa</div>
              </div>
              <button className={styles.answerButton}>
                Vastaa
              </button>
            </div>
            
            <div className={styles.gameFooter}>
              Taitaja2025 -semifinaali<br />
              Jari Peltola | Salon seudun ammattiopisto
            </div>
          </div>
        </div>
      </main>

      <section className={styles.instructionsSection}>
        <h2 className={styles.instructionsTitle}>Miten pelataan?</h2>
        <ol className={styles.instructionsList}>
          <li className={styles.instructionItem}>
            Tee valinta - keneltä haluat oppia ja mistä aiheesta?
          </li>
          <li className={styles.instructionItem}>
            Päätä, kuinka monta kysymystä haluat vastata: 5, 10 tai 15.
          </li>
          <li className={styles.instructionItem}>
            Vastaa kysymyksiin ja seuraa edistymistäsi reaaliaikaisesti.
          </li>
          <li className={styles.instructionItem}>
            Näe pistesi pelin lopukssa ja vertaa muihin.
          </li>
        </ol>
        <button className={styles.tryButton}>
          Kokeile taitojasi!
        </button>
      </section>

      <footer className={styles.footer}>
        <div>
          Taitaja2025 -semifinaali<br />
          Jari Peltola | Salon seudun ammattiopisto
        </div>
      </footer>
    </div>
  )
}
