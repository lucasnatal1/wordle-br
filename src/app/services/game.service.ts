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
  private letterIndex: number = 0
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
    const word = words[Math.floor(Math.random() * words.length)];
    return word;
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

  public onDeleteLetter(index: number): void {
    this.currentGuess[index] = '';
    this.currentGuessChanged.next(JSON.parse(JSON.stringify(this.currentGuess)));
  }

  public onAddLetter(letter: string, index: number): void {
    this.currentGuess[index] = letter;
    this.currentGuessChanged.next(JSON.parse(JSON.stringify(this.currentGuess)));
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
      this.guesses[this.currentGuessNumber-1][i].letter = this.currentGuess[i];
      if (
        currentGuessCopy[i] ===
        wordArray[i]
      ) {
        this.guesses[this.currentGuessNumber-1][i].class = 'right';
        wordArray[i] = '1';
        currentGuessCopy[i] = '1';
      } else if (
        !wordArray.includes(currentGuessCopy[i])
      ) {
        this.guesses[this.currentGuessNumber-1][i].class = 'wrong';
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
        this.guesses[this.currentGuessNumber-1][i].class = 'half';
        wordArray[wordArray.indexOf(currentGuessCopy[i])] = '1';
      } else {
        this.guesses[this.currentGuessNumber-1][i].class = 'wrong';
      }
      currentGuessCopy[i] = '1';
    }

    this.checkResult();
    this.guessesChanged.next(JSON.parse(JSON.stringify(this.guesses))); //copy
  }

  private checkResult(): void {

    if (this.currentGuess.join('') === this.getCorrectWordNormalized()) {
      this.currentGuess = ['', '', '', '', ''];
      this.currentGuessChanged.next(JSON.parse(JSON.stringify(this.currentGuess)));
      for (let i = 0; i < this.WORD_LENGTH; i++) {
        this.guesses[this.currentGuessNumber-1][i].letter = this.correctWord.charAt(i);
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
    this.currentGuessChanged.next(JSON.parse(JSON.stringify(this.currentGuess)));
    this.updateLetterIndex(0);
  }
}
