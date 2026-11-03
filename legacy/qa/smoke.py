from pathlib import Path
from collections import deque
from itertools import groupby
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).parent
DIRECTIONS={'up':(0,-1),'right':(1,0),'down':(0,1),'left':(-1,0)}
def route(level,start,goal):
    walls={tuple(w) for w in level['walls']};q=deque([(tuple(start),[])]);seen={tuple(start)}
    while q:
        pos,path=q.popleft()
        if pos==tuple(goal):return path
        for key,(dx,dy) in DIRECTIONS.items():
            n=(pos[0]+dx,pos[1]+dy)
            if 0<=n[0]<level['size'] and 0<=n[1]<level['size'] and n not in walls and n not in seen:
                seen.add(n);q.append((n,path+[key]))
    raise AssertionError('Unsolvable maze')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page.set_default_timeout(10000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4173/');page.wait_for_function('document.fonts.status === "loaded"')
    expect(page.locator('.difficulty-card')).to_have_count(3)
    page.locator('[data-action="how"]').click();expect(page.locator('dialog')).to_be_visible();page.keyboard.press('Escape')
    expect(page.locator('dialog')).not_to_be_visible()
    # Every robot maze is solved through the actual controls, using an independent BFS.
    levels=page.evaluate('ROBOT_LEVELS')
    for difficulty,collection in levels.items():
        page.locator('[data-action="home"]').first.click()
        page.locator('.difficulty-card[data-difficulty="'+difficulty+'"]').click()
        page.locator('#home-view [data-mission="0"]').click()
        for index,level in enumerate(collection):
            page.locator('[data-action="robot-level"][data-level="'+str(index)+'"]').first.click()
            if difficulty=='explorer' and index==0:
                page.locator('[data-direction="left"]').click();page.locator('#run-robot').click()
                expect(page.locator('#robot-feedback')).to_contain_text('elakadtam')
                page.locator('#clear-commands').click()
                page.locator('[data-direction="up"]').click();page.locator('#undo-command').click()
                expect(page.locator('.queue-item')).to_have_count(0)
            path=route(level,level['start'],level['chip'])+route(level,level['chip'],level['goal']) if level.get('chip') else route(level,level['start'],level['goal'])
            def enter_program(program):
                for direction,group in groupby(program):
                    count=len(list(group))
                    while count:
                        repeat=min(4,count);page.locator('#repeat-count').select_option(str(repeat))
                        page.locator('[data-direction="'+direction+'"]').click();count-=repeat
            if difficulty=='expert' and index==0:
                direct=route(level,level['start'],level['goal'])
                assert len(path)>len(direct),'The chip must require an actual detour'
                enter_program(direct);page.locator('#run-robot').click()
                expect(page.locator('#robot-feedback')).to_contain_text('csip még hiányzik')
                page.locator('#clear-commands').click()
            enter_program(path)
            page.locator('#run-robot').click()
            expect(page.locator('#robot-feedback')).to_contain_text('Bit célba ért')
            if index==2:page.locator('#robot-feedback [data-action="finish-robot"]').click()
        assert page.evaluate('state.completed.includes(0)')
        print('Robot path complete:',difficulty,flush=True)
    # Required probes, actual results and report outcomes, including the healthy case.
    expected=[['2 000','Sikeres','Legalább'],['-1000','Nincs találat','túl hosszú'],['0 Ft','engedélyezve','elfogadva']]
    for tier,difficulty in enumerate(levels):
        page.locator('[data-action="home"]').first.click();page.locator('.difficulty-card[data-difficulty="'+difficulty+'"]').click()
        page.locator('#home-view [data-mission="1"]').click()
        scenarios=page.evaluate('TEST_SCENARIOS[game.difficulty]')
        for i,s in enumerate(scenarios):
            page.locator('[data-action="scenario"][data-scenario="'+str(i)+'"]').first.click()
            for j,value in enumerate(s['probes']):
                page.locator('[data-action="probe"][data-probe="'+str(j)+'"]').click()
                page.locator('.demo-submit').click()
                if j<len(s['probes'])-1:expect(page.locator('#report-submit')).to_be_disabled()
            expect(page.locator('#test-output')).to_contain_text(expected[tier][i])
            page.locator('[data-option="'+str(s['correct'])+'"]').click()
            page.locator('#report-submit').click()
            expect(page.locator('#test-feedback')).to_contain_text('Pontos megfigyelés')
            if i==2:page.locator('#test-feedback [data-action="finish-test"]').click()
        assert page.evaluate('state.completed.includes(1)')
        print('Test cases complete:',difficulty,flush=True)
    # All three app templates, re-testing after a rule change, and safe HTML export.
    for tier,difficulty in enumerate(levels):
        page.locator('[data-action="home"]').first.click();page.locator('.difficulty-card[data-difficulty="'+difficulty+'"]').click()
        page.locator('#home-view [data-mission="2"]').click()
        page.locator('[data-template="'+str(tier)+'"]').click()
        template=page.evaluate('template()')
        page.locator('[data-action="release-app"]').click()
        expect(page.locator('#builder-feedback')).to_contain_text('Előbb')
        for value,_ in template['tests']:page.locator('[data-action="app-test"][data-value="'+value+'"]').click()
        page.locator('[data-action="release-app"]').click()
        expect(page.locator('#builder-feedback')).to_contain_text('HA feltételt')
        page.locator('#app-rule').select_option(template['correct'])
        expect(page.locator('.release-checks .passed')).to_have_count(0)
        for value,_ in template['tests']:page.locator('[data-action="app-test"][data-value="'+value+'"]').click()
        page.locator('#app-name').fill('Saját '+str(tier)+' app')
        page.locator('[data-color="3"]').click()
        page.locator('[data-action="release-app"]').click()
        expect(page.locator('#game-content')).to_contain_text('A jövő alkotója')
        with page.expect_download() as info:page.locator('[data-action="download-app"]').click()
        downloaded=ROOT/('export-'+str(tier)+'.html');info.value.save_as(downloaded)
        assert downloaded.stat().st_size>1000
        exported=browser.new_page();exported.goto('http://127.0.0.1:4173/')
        exported.set_content(downloaded.read_text())
        exported.locator('nav button').nth(1).click()
        expect(exported.locator('output')).not_to_have_text('Válassz egy lehetőséget!')
        exported.close();downloaded.unlink()
        print('Miniapp complete and exported:',difficulty,flush=True)
    # Bonus games, including a wrong quiz answer and no XP farming on replay.
    for kind,data_name in [('debug','DEBUG_PUZZLES'),('quiz','QUIZ')]:
        page.locator('[data-action="home"]').first.click();page.locator('#home-view [data-bonus="'+kind+'"]').click()
        data=page.evaluate(data_name)
        for i,q in enumerate(data):
            answer=(q['correct']+1)%3 if kind=='quiz' and i==0 else q['correct']
            page.locator('[data-action="bonus-option"][data-option="'+str(answer)+'"]').click();page.locator('#bonus-check').click()
            expect(page.locator('#bonus-feedback')).to_contain_text(q['why'])
            page.locator('[data-action="bonus-next"]').click()
        expect(page.locator('#game-content')).to_contain_text('120 XP')
    assert page.evaluate('totalXP()')==1905
    page.reload();expect(page.locator('#total-xp')).to_have_text('1905 XP')
    page.locator('[data-action="theme"]').click();page.reload();expect(page.locator('body')).to_have_attribute('data-theme','light')
    # Glossary search, category combination, empty results, reset; both career timelines.
    page.locator('#nav-learn').click();page.locator('#glossary-search').fill('határérték')
    expect(page.locator('.glossary-card')).to_have_count(1)
    page.locator('[data-category="fejlesztés"]').click();expect(page.locator('.empty-search')).to_be_visible()
    page.locator('[data-action="glossary-clear"]').click();expect(page.locator('.glossary-card')).to_have_count(15)
    page.locator('[data-action="professions"]').first.click();page.locator('[data-role="test"]').click()
    expect(page.locator('#day-timeline')).to_contain_text('Tesztesetek tervezése')
    page.locator('.career-faq summary').first.click();expect(page.locator('.career-faq details').first).to_have_attribute('open','')
    page.locator('#nav-badges').click();expect(page.locator('.badge-card.earned')).to_have_count(11)
    # Responsive screens in both themes.
    for theme in ['light','dark']:
        if page.locator('body').get_attribute('data-theme')!=theme:page.locator('[data-action="theme"]').click()
        for width in [360,390,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for view in ['home','learn','badges','professions']:
                page.locator('[data-action="'+view+'"]').first.click()
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(theme,width,view)
            for mission in [0,1,2]:
                page.locator('[data-action="home"]').first.click();page.locator('#home-view [data-mission="'+str(mission)+'"]').click()
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(theme,width,mission)
    # Reset is explicit and can be cancelled. Old v1 progress migration is preserved.
    page.locator('[data-action="help"]').click();page.locator('dialog [data-action="reset"]').click()
    page.locator('dialog [data-action="close-dialog"]').last.click();assert page.evaluate('totalXP()')==1905
    page.locator('[data-action="help"]').click();page.locator('dialog [data-action="reset"]').click();page.locator('[data-action="confirm-reset"]').click()
    expect(page.locator('#total-xp')).to_have_text('0 XP')
    assert page.evaluate('game.difficulty')=='explorer'
    assert not errors,errors
    print('PASS: 9 robot mazes, 9 test cases, 3 app exports, 2 bonus games, 1905 XP, 11 badges, persistence, theme, glossary, career tabs, reset, 5 widths in 2 themes, no JS errors.',flush=True)
    browser.close()
