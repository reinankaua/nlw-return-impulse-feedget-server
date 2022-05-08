import { MailAdapter } from "../adapters/mail-adapter";
import { FeedbacksRepository } from "../repositories/feedbacks-repository";

interface SubmitFeedbackUseCaseRequest {
    type: string;
    comment: string;
    screenshot?: string;
}

export class SubmitFeedbackUseCase {
    constructor(
        private feedbackRepository: FeedbacksRepository,
        private mailAdapter: MailAdapter,
    ) { }

    async execute(request: SubmitFeedbackUseCaseRequest) {
        const { type, comment, screenshot } = request;

        if (!type) {
            throw new Error('Type is required');
        }

        if (!comment) {
            throw new Error('Comment is required');
        }

        if (screenshot && !screenshot.startsWith('data:image/png;base64')) {
            throw new Error('Invalid screenshot format');
        }

        await this.feedbackRepository.create({
            type,
            comment,
            screenshot,
        })

        await this.mailAdapter.sendMail({
            subject: 'Novo feedback',
            body: [
                `<div style=" width: 80%; padding-left: 1em; padding-top: 0.8em">`,
                `<h2 style="font-family: sans-serif">Novo Feedback</h2>`,
                `<p style="font-family: sans-serif; line-height: 1.4em"> Tipo do Feedback: ${type} <br /> Comentario: ${comment}</p>`,
                screenshot ? `<img style="width: 75vw; border-radius: 1.2em" src="${screenshot}" />`: '',  
                `</div>`
            ].join("\n"),
        });
    }
}