// pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document";
import fs from "fs";
import path from "path";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    // Read your generated critical CSS bundle
    const cssPath = path.resolve(".next/static/css/critical.css");
    let criticalCSS = "";
    if (fs.existsSync(cssPath)) {
      criticalCSS = fs.readFileSync(cssPath, "utf-8");
    }
    return { ...initialProps, criticalCSS };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Inline critical CSS */}
          <style
            dangerouslySetInnerHTML={{
              __html: this.props.criticalCSS,
            }}
          />
          {/* Preload the stats-grid chunk */}
          <link
            rel="preload"
            href="/_next/static/chunks/ContinentStatsGrid-abc123.js"
            as="script"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
