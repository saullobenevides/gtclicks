import subprocess
import json
import sys
import time
import os
from urllib.request import urlopen
from urllib.error import URLError

def wait_for_server(url, timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            urlopen(url)
            return True
        except URLError:
            time.sleep(1)
    return False

def run_lighthouse(url):
    print(f"Running Lighthouse audit for {url}...")
    try:
        # Use npx to run lighthouse-ci/cli without global install
        # specific flags for headless and json output
        cmd = [
            "npx", "lighthouse", url,
            "--output=json",
            "--output-path=lighthouse-report.json",
            "--chrome-flags='--headless --no-sandbox'",
            "--only-categories=performance,accessibility,best-practices,seo"
        ]
        
        # On Windows shell=True might be needed for npx but often problematic. 
        # Using shell=True for Windows just in case npx is a cmd file.
        subprocess.run(cmd, shell=True, check=True)
        
        with open("lighthouse-report.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            
        scores = data["categories"]
        print("\n--- LIGHTHOUSE SCORES ---")
        for cat in scores:
            score = scores[cat]["score"] * 100
            print(f"{scores[cat]['title']}: {score:.0f}")
            
        # Check Core Web Vitals
        audits = data["audits"]
        lcp = audits["largest-contentful-paint"]["displayValue"]
        cls = audits["cumulative-layout-shift"]["displayValue"]
        inp = audits.get("interaction-to-next-paint", {}).get("displayValue", "N/A")
        
        print("\n--- CORE WEB VITALS ---")
        print(f"LCP: {lcp}")
        print(f"CLS: {cls}")
        print(f"INP: {inp}")
        
    except subprocess.CalledProcessError as e:
        print(f"Error running Lighthouse: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    target_url = "http://localhost:3000"
    
    print(f"Checking if server is running at {target_url}...")
    if wait_for_server(target_url):
        run_lighthouse(target_url)
    else:
        print("Server not found! Please run 'npm run dev' or 'npm start' first.")
        sys.exit(1)
