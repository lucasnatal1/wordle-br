import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { words, wordsNormalized } from '../words-array';

@Injectable({ providedIn: 'root' })
export class GameService {
  private WORD_LENGTH = 5;
  private MAX_GUESSES = 6;

  private correctWord: string = '';
  private correctWordNormalized: string = '';
  public guessesChanged = new Subject<{ class: string; letter: string }[][]>();
  private guesses = [
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
    [
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
      { class: '', letter: '' },
    ],
  ];
  public currentGuessChanged = new Subject<string[]>();
  private currentGuess: string[] = ['', '', '', '', ''];
  public currentGuessNumberChanged = new Subject<number>();
  private currentGuessNumber: number = 0;
  public gameStateChanged = new Subject<string>();
  private gameState: 'won' | 'lost' | 'ongoing' = 'ongoing';
  public badInputAlert = new Subject<string>();
  private letterIndex: number = 0;
  public letterIndexChanged = new Subject<number>();

  constructor() {}

  public getCorrectWord(): string {
    if (this.correctWord.length === 0) {
      this.correctWord = this.generateWord();
      this.correctWordNormalized = this.getWordNormalized(
        this.correctWord.slice()
      );
    }

    return this.correctWord.slice();
  }

  private generateWord(): string {
    // const word = words[Math.floor(Math.random() * words.length)];
    const word = words[this.seededRandom()];
    return word;
  }

  private seededRandom(): number {
    const date = new Date().toLocaleDateString('pt-br');
    const dmy = date.split('/');
    const nuDay = +dmy[0];
    const nuMonth = +dmy[1];
    const nuYear = +dmy[2];
    const seed = nuDay * nuMonth * (nuYear / 1000);
    var x = Math.sin(seed) * 10000;
    x = x - Math.floor(x);
    x = Math.floor(x * 10000);
    return x % words.length;
  }

  public getCorrectWordNormalized(): string {
    return this.correctWordNormalized.slice();
  }

  private getWordNormalized(word: string): string {
    let w = word.replace(/[àáâãäå]/g, 'a');
    w = w.replace(/[éèêë]/g, 'e');
    w = w.replace(/[íìîï]/g, 'i');
    w = w.replace(/[óòôõö]/g, 'o');
    w = w.replace(/[úùûü]/g, 'u');
    w = w.replace(/[ç]/g, 'c');
    return w;
  }

  public isGamePlayable(): boolean {
    return this.gameState === 'ongoing';
  }

  public updateLetterIndex(index: number) {
    this.letterIndex = index;
    this.letterIndexChanged.next(this.letterIndex);
  }

  public moveLeft() {
    if (this.letterIndex > 0) {
      this.letterIndex -= 1;
      this.updateLetterIndex(this.letterIndex);
    }
  }

  public moveRight() {
    if (this.letterIndex < 4) {
      this.letterIndex += 1;
      this.updateLetterIndex(this.letterIndex);
    }
  }

  private moveRightToEmptySpace() {
    if (this.letterIndex >= 4) {
      return;
    }
    for (let i = this.letterIndex + 1; i <= 4; i++) {
      if (this.currentGuess[i] === '') {
        this.letterIndex = i;
        this.updateLetterIndex(this.letterIndex);
        return;
      }
    }
  }

  public onDeleteLetter(index: number, bsFlag: boolean): void {
    this.currentGuess[index] = '';
    this.currentGuessChanged.next(
      JSON.parse(JSON.stringify(this.currentGuess))
    );
    if (bsFlag) { this.moveLeft(); }
  }

  public onAddLetter(letter: string, index: number): void {
    this.currentGuess[index] = letter;
    this.currentGuessChanged.next(
      JSON.parse(JSON.stringify(this.currentGuess))
    );
    this.moveRightToEmptySpace();
  }

  public checkValidInput(): boolean {
    if (this.currentGuess.includes('')) {
      this.badInputAlert.next('Faltam letras');
      setTimeout(() => {
        this.badInputAlert.next('');
      }, 1000);
      return false;
    }
    if (!wordsNormalized.includes(this.currentGuess.join(''))) {
      this.badInputAlert.next('Palavra não está na lista');
      setTimeout(() => {
        this.badInputAlert.next('');
      }, 1000);
      return false;
    }
    return true;
  }

  public onSubmitWord(): void {
    this.currentGuessNumber += 1;
    this.currentGuessNumberChanged.next(this.currentGuessNumber);
    let wordArray = this.getCorrectWordNormalized().split('');
    let currentGuessCopy = JSON.parse(JSON.stringify(this.currentGuess));
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      this.guesses[this.currentGuessNumber - 1][i].letter =
        this.currentGuess[i];
      if (currentGuessCopy[i] === wordArray[i]) {
        this.guesses[this.currentGuessNumber - 1][i].class = 'right';
        wordArray[i] = '1';
        currentGuessCopy[i] = '1';
      } else if (!wordArray.includes(currentGuessCopy[i])) {
        this.guesses[this.currentGuessNumber - 1][i].class = 'wrong';
        currentGuessCopy[i] = '1';
      }
    }
    // cases half
    for (let i = 0; i < currentGuessCopy.length; i++) {
      if (currentGuessCopy[i] === '1') {
        //1 is treated
        continue;
      }
      if (wordArray.includes(currentGuessCopy[i])) {
        this.guesses[this.currentGuessNumber - 1][i].class = 'half';
        wordArray[wordArray.indexOf(currentGuessCopy[i])] = '1';
      } else {
        this.guesses[this.currentGuessNumber - 1][i].class = 'wrong';
      }
      currentGuessCopy[i] = '1';
    }

    this.checkResult();
    this.guessesChanged.next(JSON.parse(JSON.stringify(this.guesses))); //copy
    this.saveTodayGame();
  }

  private checkResult(): void {
    if (this.currentGuess.join('') === this.getCorrectWordNormalized()) {
      this.currentGuess = ['', '', '', '', ''];
      this.currentGuessChanged.next(
        JSON.parse(JSON.stringify(this.currentGuess))
      );
      for (let i = 0; i < this.WORD_LENGTH; i++) {
        this.guesses[this.currentGuessNumber - 1][i].letter =
          this.correctWord.charAt(i);
      }
      this.gameState = 'won';
      this.gameStateChanged.next(this.gameState.slice());
      return;
    }

    if (this.currentGuessNumber >= this.MAX_GUESSES) {
      this.gameState = 'lost';
      this.gameStateChanged.next(this.gameState.slice());
      return;
    }

    this.currentGuess = ['', '', '', '', ''];
    this.currentGuessChanged.next(
      JSON.parse(JSON.stringify(this.currentGuess))
    );
    this.updateLetterIndex(0);
  }

  saveTodayGame() {
    const weirdleData = {
      correctWord: this.correctWordNormalized,
      guesses: this.guesses,
      currentGuessNumber: this.currentGuessNumber,
      gameState: this.gameState,
      date: (new Date()).toLocaleDateString()
    };
    localStorage.setItem('weirdleData', JSON.stringify(weirdleData));
  }

  loadTodayGame() {
    // const data = localStorage.getItem('weirdleData') != null ? JSON.parse(localStorage.getItem('weirdleData')) : null;
    const data = localStorage.getItem('weirdleData');
    if (data != null) {
      const dataObj = JSON.parse(data);
      if (dataObj && dataObj.date === (new Date()).toLocaleDateString()) {
        this.correctWord = dataObj.correctWord;
        this.currentGuessNumber = dataObj.currentGuessNumber;
        this.currentGuessNumberChanged.next(this.currentGuessNumber);
        this.guesses = dataObj.guesses;
        this.guessesChanged.next(JSON.parse(JSON.stringify(this.guesses)));
        this.gameState = dataObj.gameState;
        this.gameStateChanged.next(this.gameState.slice());
      }
    }
  }
}
