import {element, protractor, browser, by} from 'protractor';
import * as path from 'path';
import * as fs from 'fs';

export class ProtractorNotes {

    downloadRecordingBtn = '';
    copyUrlBtn = '';
    browserTimout = '';

    hitEnter = async (locator) => {
        element(by.css(locator)).sendKeys(protractor.Key.ENTER);
    }

    hitEscape = async (locator) => {
        element(by.css(locator)).sendKeys(protractor.Key.ESCAPE);
    }

    navigateBack = async () => {
        browser.navigate().back();
    }

    navigateForward = async () => {
        browser.navigate().forward();
    }

    switchWindowHandle = async (index) => {
        browser.getAllWindowHandles().then((handles) => {
            browser.switchTo().window(handles[index]);
        });
    }

    switchToIFrame = async (locator) => {
        browser.switchTo().frame(element(by.css(locator)).getWebElement());
    }

    switchToDefaultFrame = async () => {
        browser.switchTo().defaultContent();
    }

    verifyText = async (locator, expectedText) => {
        element(by.css(locator)).getWebElement().getText().then((text) => {
            expect(text).toEqual(expectedText);
        });
    }

    verifyTableCount = async (locator, expectedCount) => {
        element.all(by.xpath(locator)).count().then((count) => {
            expect(count).toEqual(expectedCount);
        });
    }

    verifyPageTitle = async (expectedTitle) => {
        browser.getTitle().then((title) => {
            expect(title).toEqual(expectedTitle);
        });
    }

    verifyUrl = async (expectedUrl) => {
        browser.getCurrentUrl().then((url) => {
            expect(url).toEqual(expectedUrl);
        });
    }

    verifyCss = async (locator, attribute, expectedValue) => {
        element(by.css(locator)).getWebElement().getCssValue(attribute).then((value) => {
            expect(value).toEqual(expectedValue);
        });
    }

    takeScreenShot = async (dir, filename) => {

        function writeScreenShot(image, name) {
            const stream = fs.createWriteStream(path.join(dir, name));
            stream.write(new Buffer(image, 'base64'));
            stream.end();
        }

        browser.takeScreenshot().then((png) => {
            writeScreenShot(png, filename);
        });
    }

    verifyToolTip = async (toolLocator, tipLocator) => {

        await browser.wait(EC.visibilityOf(element(by.css(toolLocator))), this.browserTimout);

        browser.actions().mouseMove(element(by.css(toolLocator))).perform().then(() => {
            expect(element(by.css(tipLocator)).getWebElement().isDisplayed()).toBeTruthy();
        });
    }

    verifyPageTitle = async (text) => {

        browser.getTitle().then((title) => {
            expect(title).toEqual(text);
        });
    }

    verifyElementText = async (locator, text) => {

        await browser.wait(EC.visibilityOf(element(by.css(locator))), this.browserTimout);

        element(by.css(locator)).getWebElement().getText().then((elementText) => {
            expect(elementText).toMatch(text);
        });
    }

    verifyUrlText = async (text) => {
        await browser.wait(EC.urlContains(text), this.browserTimout);
    }

    verifyVisibilityOfElement = async (locator) => {
        expect(element(by.css(locator)).getWebElement().isDisplayed()).toBeTruthy();
    }

    downloadRecording = async (targetDirectory) => {

        await browser.wait(EC.elementToBeClickable(element(by.css(this.downloadRecordingBtn))), this.browserTimout);
        element(by.css(this.downloadRecordingBtn)).getWebElement().click();

        function waitForFiles(dir, maxTries) {

            return new Promise((resolve, reject) => {

                let pollNumber = 0;

                const pollInterval = setInterval(() => {
                    const list = fs.readdirSync(dir);

                    const mp4Files = list.filter((f) => {
                        return f.endsWith('.mp4');
                    });

                    if (mp4Files.length > 0) {
                        clearInterval(pollInterval);
                        resolve(mp4Files);
                    }

                    pollNumber += 1;
                    if (pollNumber >= maxTries) {
                        clearInterval(pollInterval);
                        reject(new Error('Max Tries for file existence was reached'));
                    }
                }, 1000);
            });
        }

        browser.driver.wait(() => {
            return waitForFiles(targetDirectory, 10);
        }, 20000).then((files) => {

            const fileFound = files[0];
            console.log(fs.statSync(targetDirectory + fileFound).size);
        });
    }

    checkCss = async (locator, attribute, expectedValue) => {

        await browser.wait(EC.visibilityOf(element(by.css(locator))), this.browserTimout);

        element(by.css(locator)).getWebElement().getCssValue(attribute).then((value) => {
            expect(value).toBe(expectedValue);

        });
    }

    copyRecordingUrl = async () => {

        await browser.wait(EC.visibilityOf(element(by.css(this.copyUrlBtn))), this.browserTimout);
        element(by.css(this.copyUrlBtn)).getWebElement().click();

        browser.executeScript(() => {

            // create a new web element
            const el = document.createElement('input');
            el.setAttribute('id', 'customInput');
            document.getElementsByTagName('body')[0].appendChild(el);

            // enter clipboard text into new web element
            let newWindowNavigator;
            newWindowNavigator = window.navigator;
            const newInput = document.getElementById('customInput');
            newWindowNavigator.clipboard.readText().then(text => {
                newInput.value = text;
            });
        });

        await element(by.id('customInput')).getWebElement().getAttribute('value').then((text) => {
            expect(text).not.toEqual(null);
        });
    }

    dragAndDrop = async (locator, xPixels, yPixels) => {

        const el = element(by.css(locator));
        await browser.wait(EC.visibilityOf(el), this.browserTimeout);
        browser.actions().dragAndDrop(el.getWebElement(), {x: xPixels, y: yPixels}).perform();

    }
}
