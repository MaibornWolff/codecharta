import projectKtContents from '../../../analysis/model/src/main/kotlin/de/maibornwolff/codecharta/model/Project.kt?raw';
import { extractCcJsonVersion } from './ccJsonVersion';

export const ccJsonVersion = extractCcJsonVersion(projectKtContents);
