from playwright.sync_api import sync_playwright
from pathlib import Path
import json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread

root=Path(__file__).parents[1]/'app/src/main/assets'
server=ThreadingHTTPServer(('127.0.0.1',8789),partial(SimpleHTTPRequestHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url='http://127.0.0.1:8789/index.html'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for viewport in ({'width':412,'height':915},{'width':800,'height':1280}):
        page=browser.new_page(viewport=viewport)
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.evaluate('''window.__stateSaved = null;window.__speech=[];
        window.MorrisonNative={
          loadState:()=>'',saveState:(s)=>{window.__stateSaved=s},
          hasModel:()=>false, modelSizeMb:()=>0,
          getVoices:()=>JSON.stringify([{name:'Spanish Offline Demo',locale:'es-CL'}]),
          speak:(t)=>window.__speech.push(t),
          chooseVoice:()=>{},openModelDownload:()=>{},importModel:()=>{},loadModel:()=>{},
          importBackup:()=>{},exportBackup:()=>{},record:()=>{}
        };''')
        page.on('dialog',lambda d:d.accept())
        page.set_content((root/'index.html').read_text(encoding='utf-8'), wait_until='load')
        assert page.locator('#page-inicio.active').count()==1
        assert 'MORRISON' in page.title()
        page.locator('[data-go=agenda]').first.click()
        page.locator('#taskName').fill('Revisar proyecto Rapa Nui')
        page.locator('#taskForm button[type=submit]').click()
        assert 'Revisar proyecto Rapa Nui' in page.locator('#taskList').inner_text()
        page.locator('[data-page=chat]:visible').first.click()
        page.locator('#chatInput').fill('Morrison, resume mis pendientes')
        page.locator('#sendButton').click()
        assert 'Revisar proyecto Rapa Nui' in page.locator('#chatLog').inner_text()
        page.locator('[data-page=proyectos]:visible').first.click()
        page.locator('#projectName').fill('Planetario Rapa Nui')
        page.locator('#projectForm button[type=submit]').click()
        assert 'Planetario Rapa Nui' in page.locator('#projectList').inner_text()
        page.evaluate("document.querySelector('[data-page=memoria]').click()")
        page.locator('#noteTitle').fill('Preferencia de voz')
        page.locator('#noteBody').fill('Voz masculina de español')
        page.locator('#noteForm button[type=submit]').click()
        assert 'Voz masculina de español' in page.locator('#noteList').inner_text()
        state=page.evaluate('window.__stateSaved')
        data=json.loads(state)
        assert len(data['tasks'])==1 and len(data['projects'])==2 and len(data['notes'])==1
        assert len(errors)==0, errors
        overflow=page.evaluate('document.documentElement.scrollWidth > document.documentElement.clientWidth + 2')
        assert not overflow, 'Horizontal overflow on '+str(viewport)
        print('OK responsive UI',viewport,'projects',len(data['projects']),'tasks',len(data['tasks']),'notes',len(data['notes']))
        if viewport['width']==412:
            page.locator('[data-page=inicio]:visible').first.click()
            page.screenshot(path='/mnt/data/MORRISON_LOCAL_preview.png',full_page=True)
        page.close()
    browser.close()
server.shutdown()